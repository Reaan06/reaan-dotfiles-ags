import { Astal, Gdk } from "astal/gtk3"
import app from "astal/gtk3/app"
import Workspaces from "./Workspaces"
import Clock from "./Clock"
import Weather from "./Weather"
import Media from "./Media"
import SystemStatus from "./SystemStatus"

export default function Bar(monitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        visible
        name={`bar-${monitor}`}
        class="bar"
        gdkmonitor={monitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox class="BarContainer">
            <box class="start" spacing={12}>
                <Workspaces />
            </box>
            <box class="center" spacing={12}>
                <Media />
                <Clock />
                <Weather />
            </box>
            <box class="end" spacing={12}>
                <SystemStatus />
            </box>
        </centerbox>
    </window>
}
