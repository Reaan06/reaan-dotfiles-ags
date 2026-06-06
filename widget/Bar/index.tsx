import { Astal, Gdk, Gtk } from "ags/gtk3"
import { execAsync } from "ags/process"; import { createBinding, createState } from "gnim"
import Workspaces from "./modules/Workspaces"
import Clock from "./modules/Clock"
import Weather from "./modules/Weather"
import Network from "./modules/Network"
import Bluetooth from "./modules/Bluetooth"
import Volume from "./modules/Volume"
import Battery from "./modules/Battery"
import KeyboardLayout from "./modules/KeyboardLayout"

export default function Bar(monitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        class="BarWindow"
        gdkmonitor={monitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}>
        <centerbox class="BarContainer">
            <box class="left" spacing={12} halign={Gtk.Align.START}>
                <button class="search" onClicked={() => execAsync("rofi -show drun")}><label label="" /></button>
                <button class="settings" onClicked={() => execAsync("systemsettings")}><label label="" /></button>
                <Workspaces />
            </box>
            <box class="center" spacing={20} halign={Gtk.Align.CENTER}>
                <Clock />
                <Weather />
            </box>
            <box class="right" spacing={12} halign={Gtk.Align.END}>
                <Network />
                <KeyboardLayout />
                <Bluetooth />
                <Volume />
                <Battery />
                <button class="power" onClicked={() => execAsync("wlogout")}><label label="" /></button>
            </box>
        </centerbox>
    </window>
}
