import app from "ags/gtk3/app"
import { Variable } from "ags/variable"
print("SUCCESS VARIABLE")
const v = Variable("test")
print(`Value: ${v.get()}`)
