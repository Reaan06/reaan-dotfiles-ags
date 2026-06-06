/**
 * service/notifications.ts — Notification daemon service
 *
 * Implements the org.freedesktop.Notifications D-Bus protocol.
 * Maintains a bounded history and a list of currently visible popups.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2
 */

import { Service, Variable } from "astal";
import type { AppConfig } from "../config/config.js";
import type { Notification, DismissReason } from "../util/types.js";
import { logger } from "../util/logger.js";

// ---------------------------------------------------------------------------
// D-Bus interface XML for org.freedesktop.Notifications
// ---------------------------------------------------------------------------

const NOTIFICATIONS_IFACE_XML = `
<node>
  <interface name="org.freedesktop.Notifications">
    <method name="GetCapabilities">
      <arg direction="out" type="as" name="capabilities"/>
    </method>
    <method name="Notify">
      <arg direction="in"  type="s"     name="app_name"/>
      <arg direction="in"  type="u"     name="replaces_id"/>
      <arg direction="in"  type="s"     name="app_icon"/>
      <arg direction="in"  type="s"     name="summary"/>
      <arg direction="in"  type="s"     name="body"/>
      <arg direction="in"  type="as"    name="actions"/>
      <arg direction="in"  type="a{sv}" name="hints"/>
      <arg direction="in"  type="i"     name="expire_timeout"/>
      <arg direction="out" type="u"     name="id"/>
    </method>
    <method name="CloseNotification">
      <arg direction="in" type="u" name="id"/>
    </method>
    <method name="GetServerInformation">
      <arg direction="out" type="s" name="name"/>
      <arg direction="out" type="s" name="vendor"/>
      <arg direction="out" type="s" name="version"/>
      <arg direction="out" type="s" name="spec_version"/>
    </method>
    <signal name="NotificationClosed">
      <arg type="u" name="id"/>
      <arg type="u" name="reason"/>
    </signal>
    <signal name="ActionInvoked">
      <arg type="u" name="notification_id"/>
      <arg type="s" name="action_key"/>
    </signal>
  </interface>
</node>
`;

// Reason codes as defined by the org.freedesktop.Notifications spec:
//   1 = expired, 2 = dismissed-by-user, 3 = action-invoked, 4 = undefined
const DISMISS_REASON_CODE: Record<DismissReason, number> = {
  "expired": 1,
  "dismissed-by-user": 2,
  "action-invoked": 3,
};

// ---------------------------------------------------------------------------
// NotificationService
// ---------------------------------------------------------------------------

/**
 * NotificationService — AGS Service that acts as a D-Bus notification daemon.
 *
 * Registers `org.freedesktop.Notifications` on the session bus, receives
 * incoming notifications, maintains a bounded history, and manages the list
 * of currently visible popup notifications.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 9.1, 9.2
 */
export class NotificationService extends Service {
  static {
    Service.register(
      this,
      {},
      {
        // Reactive properties exposed to widgets (Requirement 9.1)
        notifications: ["jsobject", "r"],
        popups: ["jsobject", "r"],
      },
    );
  }

  /** Full notification history (bounded to historyLimit). Requirement 5.5 */
  readonly notifications = new Variable<Notification[]>([]);

  /** Notifications currently shown as popups. Requirement 5.2 */
  readonly popups = new Variable<Notification[]>([]);

  private _idCounter = 1;
  private _historyLimit: number;

  /** D-Bus connection used to emit signals. */
  private _dbusConnection: Gio.DBusConnection | null = null;

  /** Registration ID returned by Gio.DBusConnection.register_object(). */
  private _registrationId = 0;

  constructor(config: AppConfig) {
    super();
    this._historyLimit = config.notificationHistoryLimit;
    this._registerDBus();
  }

  // -------------------------------------------------------------------------
  // D-Bus registration
  // -------------------------------------------------------------------------

  /**
   * Registers the org.freedesktop.Notifications name and object on the
   * session bus.  Errors are logged but never re-thrown so that other
   * services can continue initialising (Requirement 5.7).
   */
  private _registerDBus(): void {
    try {
      const conn = Gio.DBus.session;
      this._dbusConnection = conn;

      // Parse the interface XML once
      const nodeInfo = Gio.DBusNodeInfo.new_for_xml(NOTIFICATIONS_IFACE_XML);
      const ifaceInfo = nodeInfo.lookup_interface("org.freedesktop.Notifications");

      if (!ifaceInfo) {
        logger.error("NotificationService", "Failed to parse D-Bus interface XML");
        return;
      }

      // Register the object at the well-known path
      this._registrationId = conn.register_object(
        "/org/freedesktop/Notifications",
        ifaceInfo,
        // Method call handler
        (
          _connection: Gio.DBusConnection,
          _sender: string,
          _objectPath: string,
          _interfaceName: string,
          methodName: string,
          parameters: GLib.Variant,
          invocation: Gio.DBusMethodInvocation,
        ) => {
          this._handleMethodCall(methodName, parameters, invocation);
        },
        // Get property handler (not used)
        null,
        // Set property handler (not used)
        null,
      );

      // Acquire the well-known bus name (Requirement 5.1)
      Gio.DBus.session.own_name(
        "org.freedesktop.Notifications",
        Gio.BusNameOwnerFlags.NONE,
        () => {
          logger.info("NotificationService", "D-Bus name acquired: org.freedesktop.Notifications");
        },
        () => {
          logger.error("NotificationService", "D-Bus name lost or could not be acquired");
        },
      );
    } catch (e) {
      // Requirement 5.7: D-Bus unavailable → log error, no crash
      logger.error("NotificationService", "D-Bus unavailable, notification daemon disabled", e);
    }
  }

  // -------------------------------------------------------------------------
  // D-Bus method dispatch
  // -------------------------------------------------------------------------

  private _handleMethodCall(
    methodName: string,
    parameters: GLib.Variant,
    invocation: Gio.DBusMethodInvocation,
  ): void {
    try {
      switch (methodName) {
        case "GetCapabilities":
          invocation.return_value(
            new GLib.Variant("(as)", [["body", "body-markup", "actions", "icon-static"]]),
          );
          break;

        case "GetServerInformation":
          invocation.return_value(
            new GLib.Variant("(ssss)", ["ags-notifications", "ags", "1.0", "1.2"]),
          );
          break;

        case "Notify": {
          const [
            appName,
            replacesId,
            appIcon,
            summary,
            body,
            actionsArray,
            _hints,
            expireTimeout,
          ] = parameters.deep_unpack() as [
            string,
            number,
            string,
            string,
            string,
            string[],
            Record<string, unknown>,
            number,
          ];

          // Parse actions: flat array of [id, label, id, label, ...]
          const actions: Array<{ id: string; label: string }> = [];
          for (let i = 0; i + 1 < actionsArray.length; i += 2) {
            actions.push({ id: actionsArray[i], label: actionsArray[i + 1] });
          }

          // If replacesId > 0, reuse that ID (replace existing notification)
          const replaceId = replacesId > 0 ? replacesId : undefined;

          const assignedId = this.notify(
            {
              appName: appName || "",
              summary: summary || "",
              body: body || "",
              icon: appIcon || "",
              timeout: expireTimeout,
              actions,
            },
            replaceId,
          );

          invocation.return_value(new GLib.Variant("(u)", [assignedId]));
          break;
        }

        case "CloseNotification": {
          const [id] = parameters.deep_unpack() as [number];
          this.dismiss(id, "dismissed-by-user");
          invocation.return_value(null);
          break;
        }

        default:
          // Return an error for unknown methods
          invocation.return_dbus_error(
            "org.freedesktop.DBus.Error.UnknownMethod",
            `Unknown method: ${methodName}`,
          );
      }
    } catch (e) {
      logger.error("NotificationService", `Error handling D-Bus method ${methodName}`, e);
      invocation.return_dbus_error(
        "org.freedesktop.DBus.Error.Failed",
        String(e),
      );
    }
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Add a new notification (or replace an existing one if `replaceId` is given).
   *
   * - Assigns an incremental ID (Requirement 5.1)
   * - Prepends to history, trimming to `historyLimit` (Requirement 5.5)
   * - Adds to popups (Requirement 5.2)
   * - Schedules auto-dismiss when `timeout > 0` (Requirement 5.3)
   *
   * @returns The assigned notification ID.
   */
  notify(
    n: Omit<Notification, "id" | "timestamp">,
    replaceId?: number,
  ): number {
    const id =
      replaceId !== undefined && replaceId > 0
        ? replaceId
        : this._idCounter++;

    // Keep _idCounter ahead of any manually supplied ID
    if (id >= this._idCounter) {
      this._idCounter = id + 1;
    }

    const notification: Notification = {
      ...n,
      id,
      timestamp: Date.now(),
    };

    // --- History (bounded, newest first) ---
    const currentHistory = this.notifications.getValue();
    // Remove any existing notification with the same ID (replace case)
    const filteredHistory = currentHistory.filter(
      (existing: Notification) => existing.id !== id,
    );
    const updatedHistory = [notification, ...filteredHistory].slice(
      0,
      this._historyLimit,
    );
    this.notifications.setValue(updatedHistory);

    // --- Popups ---
    const currentPopups = this.popups.getValue();
    // Replace existing popup with same ID if present, otherwise append
    const filteredPopups = currentPopups.filter(
      (existing: Notification) => existing.id !== id,
    );
    this.popups.setValue([...filteredPopups, notification]);

    // --- Auto-dismiss (Requirement 5.3) ---
    if (n.timeout > 0) {
      // Use GLib.timeout_add for GJS compatibility; fall back to setTimeout
      // in non-GJS environments (e.g., vitest).
      try {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, n.timeout, () => {
          this.dismiss(id, "expired");
          return GLib.SOURCE_REMOVE;
        });
      } catch {
        // Fallback for non-GJS environments
        setTimeout(() => this.dismiss(id, "expired"), n.timeout);
      }
    }

    return id;
  }

  /**
   * Remove a notification from the popup list and emit the D-Bus
   * `NotificationClosed` signal with the correct reason code.
   *
   * Requirements: 5.4, 5.6
   */
  dismiss(id: number, reason: DismissReason): void {
    const currentPopups = this.popups.getValue();
    this.popups.setValue(currentPopups.filter((n: Notification) => n.id !== id));

    // Emit D-Bus NotificationClosed signal (Requirement 5.6)
    this._emitNotificationClosed(id, reason);
  }

  // -------------------------------------------------------------------------
  // D-Bus signal emission
  // -------------------------------------------------------------------------

  /**
   * Emits the `NotificationClosed` D-Bus signal on the session bus.
   * Errors are logged but never re-thrown (Requirement 9.2).
   */
  private _emitNotificationClosed(id: number, reason: DismissReason): void {
    if (!this._dbusConnection) return;

    try {
      this._dbusConnection.emit_signal(
        null, // broadcast to all listeners
        "/org/freedesktop/Notifications",
        "org.freedesktop.Notifications",
        "NotificationClosed",
        new GLib.Variant("(uu)", [id, DISMISS_REASON_CODE[reason]]),
      );
    } catch (e) {
      logger.error(
        "NotificationService",
        "Failed to emit NotificationClosed signal",
        e,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Cleanup
  // -------------------------------------------------------------------------

  /**
   * Unregisters the D-Bus object when the service is destroyed.
   * Supports Requirement 9.3 (listener cleanup on destruction).
   */
  destroy(): void {
    if (this._dbusConnection && this._registrationId > 0) {
      try {
        this._dbusConnection.unregister_object(this._registrationId);
      } catch (e) {
        logger.error(
          "NotificationService",
          "Failed to unregister D-Bus object",
          e,
        );
      }
    }
    super.destroy();
  }
}
