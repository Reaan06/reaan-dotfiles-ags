// Import shim early to ensure compatibility with runtimes that lack createState().poll
import './src/compat/gnim-poll-shim'
import app from "ags/gtk3/app"
import Bar from "./widget/Bar/index"

app.start({
    instanceName: "ags-bar",
    css: "./style.css",
    main() {
        const monitors = app.get_monitors()
        for (const monitor of monitors) {
            Bar(monitor)
        }
    },
})
