/**
 * Widget para mostrar el estado del sistema: audio, red y batería.
 */
import Box from "resource:///com/github/Aylur/ags/widgets/box.js";
import Label from "resource:///com/github/Aylur/ags/widgets/label.js";
import { AudioService } from "../../service/audio.js";
import { BatteryService } from "../../service/battery.js";
import { NetworkService } from "../../service/network.js";
import { config } from "../../config/config.js";

const audio = new AudioService(config);
const battery = new BatteryService();
const network = new NetworkService();

export default () => Box({
  className: "system-status",
  spacing: 8,
  children: [
    // Mostrar volumen del audio
    Label({
      className: "audio",
      label: audio.volume.bind().as((v: number) => `Vol: ${Math.round(v * 100)}%`),
    }),
    // Mostrar estado de la red (conectado/desconectado)
    Label({
      className: "network",
      label: network.connected.bind().as((s: boolean) => s ? "󰖩" : "󰖪"),
    }),
    // Mostrar porcentaje de batería
    Label({
      className: "battery",
      label: battery.percentage.bind().as((p: number) => `${p}%`),
    }),
  ],
});
