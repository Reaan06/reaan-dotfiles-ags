import app from "ags/gtk3/app"
print("Keys of app:")
for (const key in app) {
    print(` - ${key}`)
}
if (app.start) print("app.start exists")
if (app.get_monitors) print("app.get_monitors exists")
