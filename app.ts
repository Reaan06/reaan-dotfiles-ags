import app from "ags/gtk3/app"
import Bar from "./widget/Bar"

print("FILE LOADED")

app.start({
    instanceName: "hyprland-shell-test",
    main() {
        print("MAIN CALLED")
        try {
            const monitors = app.get_monitors()
            print(`Monitors: ${monitors.length}`)
            for (const monitor of monitors) {
                print(`Creating bar for ${monitor}`)
                Bar(monitor)
            }
        } catch (e) {
            print(`ERROR IN MAIN: ${e}`)
        }
    },
})
