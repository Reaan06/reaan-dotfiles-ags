import Label from "resource:///com/github/Aylur/ags/widgets/label.js";
import { Variable } from "resource:///com/github/Aylur/ags/variable.js";

// Variable que almacena el tiempo actual, actualizándose cada segundo (1000ms)
// mediante el comando 'date' con el formato especificado.
const time = new Variable("", {
    poll: [1000, 'date "+%a %d %b, %H:%M:%S"'],
});

/**
 * Widget de Reloj para la barra superior.
 * Muestra la fecha y hora formateada.
 */
export default () => Label({
    className: "clock",
    label: time.bind(),
});
