import app from "ags/gtk3/app"
import { Astal, Gtk, Gdk } from "ags/gtk3"
import Workspaces from "./bar/Workspaces"
import Media from "./bar/Media"
import Clock from "./bar/Clock"

export default function Bar(monitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        visible
        name={`bar-${monitor}`}
        class="BarWindow"
        gdkmonitor={monitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox class="BarContainer">
            <box halign={Gtk.Align.START}>
                <Workspaces />
            </box>
            <box halign={Gtk.Align.CENTER}>
                <Media />
            </box>
            <box halign={Gtk.Align.END}>
                <Clock />
            </box>
        </centerbox>
    </window>
}
