// Definiciones para recursos de AGS
declare module "resource:///com/github/Aylur/ags/app.js" {
    const App: any;
    export default App;
}

declare module "resource:///com/github/Aylur/ags/service.js" {
    const Service: any;
    export default Service;
}

declare module "resource:///com/github/Aylur/ags/variable.js" {
    export class Variable<T> {
        constructor(value: T);
        setValue(value: T): void;
        getValue(): T;
        bind(): any;
    }
}

declare module "resource:///com/github/Aylur/ags/utils.js" {
    export function execAsync(cmd: string | string[]): Promise<string>;
    export const Utils: any;
}

declare module "resource:///com/github/Aylur/ags/service/audio.js" {
    const Audio: any;
    export default Audio;
}

declare module "resource:///com/github/Aylur/ags/service/battery.js" {
    const Battery: any;
    export default Battery;
}

declare module "resource:///com/github/Aylur/ags/service/network.js" {
    const Network: any;
    export default Network;
}

declare module "resource:///com/github/Aylur/ags/service/notifications.js" {
    const Notifications: any;
    export default Notifications;
}

declare module "resource:///com/github/Aylur/ags/widgets/label.js" {
    const Label: any;
    export default Label;
}

declare module "resource:///com/github/Aylur/ags/widgets/box.js" {
    const Box: any;
    export default Box;
}

declare module "resource:///com/github/Aylur/ags/widgets/button.js" {
    const Button: any;
    export default Button;
}

// Soporte para importaciones gi://
declare module "gi://GLib" {
    export const GLib: any;
    export default GLib;
}

declare module "gi://Gio" {
    export const Gio: any;
    export default Gio;
}

// Globales de GJS como namespaces para que funcionen como tipos
declare namespace GLib {
    const PRIORITY_DEFAULT: number;
    const SOURCE_REMOVE: boolean;
    function getenv(name: string): string | null;
    function get_home_dir(): string;
    function file_get_contents(path: string): [boolean, Uint8Array];
    function timeout_add(priority: number, interval: number, callback: () => boolean): number;
    class Variant {
        constructor(format: string, value: any);
        deep_unpack(): any;
    }
}

declare namespace Gio {
    interface InputStream {}
    interface AsyncResult {}
    class SocketClient {
        connect(address: any, cancellable: any): any;
    }
    class UnixSocketAddress {
        static new(path: string): any;
    }
    class DataInputStream {
        constructor(args: { base_stream: any });
        read_line_async(priority: number, cancellable: any, callback: any): void;
        read_line_finish_utf8(result: any): [string | null, number];
    }
    class DBusConnection {
        emit_signal(destination: string | null, path: string, iface: string, signal: string, parameters: any): void;
        unregister_object(id: number): void;
    }
    class DBusMethodInvocation {
        return_value(value: any): void;
        return_dbus_error(name: string, message: string): void;
    }
    namespace DBus {
        const session: any;
    }
    class DBusNodeInfo {
        static new_for_xml(xml: string): any;
    }
    namespace BusNameOwnerFlags {
        const NONE: any;
    }
    class FileInfo {
        get_name(): string;
    }
    namespace File {
        function new_for_path(path: string): any;
    }
    namespace FileQueryInfoFlags {
        const NONE: any;
    }
}

declare const Utils: any;
