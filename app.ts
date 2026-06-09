// Import shim early to ensure compatibility with runtimes that lack createState().poll
import './src/compat/gnim-poll-shim'
import { safeRequire } from './src/compat/gi-typelib-guard'
import app from "ags/gtk3/app"
import Bar from "./widget/Bar/index"

app.start({
    instanceName: "ags-bar",
    css: "./style.css",
    main() {
        // early check: ensure critical typelibs present (hyprland) — if missing, app may still run but features degrade
        const hypr = safeRequire('AstalHyprland', '0.1')
        if (!hypr.present) {
            // log warning — runtime should continue but without hypr bindings
            console.warn('Warning: AstalHyprland typelib not present; workspace integration disabled')
        }
        const monitors = app.get_monitors()
        for (const monitor of monitors) {
            Bar(monitor)
        }
    },
})
