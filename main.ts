// main.ts
// Configuración principal de la aplicación AGS
import App from "resource:///com/github/Aylur/ags/app.js";
import Bar from "./widget/bar/Bar.js";

App.config({
  style: "./style.css",
  windows: [
    Bar(0),
  ],
});
