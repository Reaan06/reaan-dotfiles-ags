import app from "ags/gtk3/app"
import { Astal, Gtk, Gdk } from "ags/gtk3"

export default function Bar(monitor: Gdk.Monitor) {
    return <window
        name="test-bar"
        visible={true}
        application={app}>
        <box css="background: red; min-height: 50px; min-width: 50px;">
            <label label="TEST" />
        </box>
    </window>
}
