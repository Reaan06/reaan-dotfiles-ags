import { Astal, Gdk } from "ags/gtk3"
import app from "ags/gtk3/app"
import Workspaces from "./Workspaces"
import Clock from "./Clock"
import Weather from "./Weather"
import SystemStatus from "./SystemStatus"

export default function Bar(monitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        visible
        name={`bar-old-${monitor}`}
        class="bar"
        gdkmonitor={monitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox class="BarContainer">
            <box class="start">
                <Workspaces />
            </box>
            <box class="center" spacing={12}>
                <Clock />
                <Weather />
            </box>
            <box class="end">
                <SystemStatus />
            </box>
        </centerbox>
    </window>
}
