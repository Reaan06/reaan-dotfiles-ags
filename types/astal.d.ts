declare module "astal" {
    export class Service {
        static register(target: any, signals: any, properties: any): void;
        connect(signal: string, callback: () => void): void;
    }
    export class Variable<T> {
        constructor(value: T);
        setValue(value: T): void;
        getValue(): T;
    }
    export class App {
        static start(config: any): void;
    }
    export function bind(variable: any): any;
    export function For(variable: any, callback: (item: any) => any): any;
}

declare module "astal/mpris" {
    const Mpris: any;
    export default Mpris;
}

declare module "astal/hyprland" {
    const Hyprland: any;
    export default Hyprland;
}

declare module "astal/battery" {
    const Battery: any;
    export default Battery;
}

declare module "astal/network" {
    const Network: any;
    export default Network;
}

declare module "astal/wireplumber" {
    const WirePlumber: any;
    export default WirePlumber;
}

declare module "astal/audio" {
    const Audio: any;
    export default Audio;
}

declare module "astal/gtk3" {
    export const Astal: any;
    export const Gtk: any;
    export const Gdk: any;
    const App: any;
    export default App;
}

declare module "astal/*" {
    const content: any;
    export default content;
}
