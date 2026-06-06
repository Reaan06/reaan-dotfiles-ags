// main.ts
// Configuración principal de la aplicación AGS
import App from "ags";
import Bar from "./widget/bar/Bar.js";

App.config({
  style: "./style.css",
  windows: [
    Bar(0),
  ],
});
