// widget/bar/Bar.ts
// Ensamblaje de la barra superior para el monitor especificado
import Window from "resource:///com/github/Aylur/ags/widgets/window.js";
import CenterBox from "resource:///com/github/Aylur/ags/widgets/centerbox.js";
import Box from "resource:///com/github/Aylur/ags/widgets/box.js";
import Workspaces from "./Workspaces.js";
import Clock from "./Clock.js";
import Weather from "./Weather.js";
import SystemStatus from "./SystemStatus.js";
import { hyprland } from "../../service/hyprland.js";

export default (monitor: number = 0) => Window({
  name: `bar-${monitor}`,
  className: "bar",
  monitor,
  anchor: ["top", "left", "right"],
  exclusivity: "exclusive",
  child: CenterBox({
    startWidget: Box({
      className: "start",
      children: [Workspaces({ hyprland })],
    }),
    centerWidget: Box({
      className: "center",
      spacing: 12,
      children: [Clock(), Weather()],
    }),
    endWidget: Box({
      className: "end",
      children: [SystemStatus()],
    }),
  }),
});
