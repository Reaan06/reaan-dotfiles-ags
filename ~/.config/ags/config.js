import App from 'resource:///com/github/Aylurs/ags/app.js';
import { Dock } from './dock/Dock.js';

// Expose togglePinned globally for Hyprland binding
globalThis.togglePinned = () => {
    const dock = App.getWindow('dock');
    if (dock) {
        dock.togglePinned();
    }
};

App.config({
    windows: [
        Dock(),
    ],
    style: './style/dock.css',
});
