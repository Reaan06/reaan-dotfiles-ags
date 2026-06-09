import Widget from 'resource:///com/github/Aylurs/ags/widget.js';
import { DockItem } from './DockItem.js';
import { loadState, saveState } from './state.js';
import Variable from 'resource:///com/github/Aylurs/ags/variable.js';

const APPS = [
    { name: "Files",       exec: "nautilus",               icon: "org.gnome.Nautilus",         wm_class: "nautilus"     },
    { name: "Launchpad",   exec: "ags -r 'launcher.show()'", icon: "view-app-grid-symbolic",   wm_class: null           },
    { name: "Browser",     exec: "firefox",                icon: "firefox",                    wm_class: "firefox"      },
    { name: "Telegram",    exec: "telegram-desktop",       icon: "telegram",                   wm_class: "telegram"     },
    { name: "Mail",        exec: "thunderbird",            icon: "thunderbird",                wm_class: "thunderbird"  },
    { name: "Maps",        exec: "gnome-maps",             icon: "org.gnome.Maps",             wm_class: "gnome-maps"   },
    { name: "Photos",      exec: "shotwell",               icon: "shotwell",                   wm_class: "shotwell"     },
    { name: "Camera",      exec: "cheese",                 icon: "cheese",                     wm_class: "cheese"       },
    { name: "Calendar",    exec: "gnome-calendar",         icon: "org.gnome.Calendar",         wm_class: "gnome-calendar"},
    { name: "Notes",       exec: "gnome-text-editor",      icon: "org.gnome.TextEditor",       wm_class: "text-editor"  },
    { name: "VLC",         exec: "vlc",                    icon: "vlc",                        wm_class: "vlc"          },
    { name: "Music",       exec: "rhythmbox",              icon: "rhythmbox",                  wm_class: "rhythmbox"    },
    { name: "Impress",     exec: "libreoffice --impress",  icon: "libreoffice-impress",        wm_class: "soffice"      },
    { name: "Calc",        exec: "libreoffice --calc",     icon: "libreoffice-calc",           wm_class: "soffice"      },
    { name: "Writer",      exec: "libreoffice --writer",   icon: "libreoffice-writer",         wm_class: "soffice"      },
    { name: "App Store",   exec: "pamac-manager",          icon: "org.gnome.Software",         wm_class: "pamac-manager"},
    { name: "Settings",    exec: "gnome-control-center",   icon: "org.gnome.Settings",         wm_class: "gnome-control"},
];

export const Dock = () => {
    const state = Variable(loadState());
    
    const dockContent = Widget.Box({
        class_name: 'dock-content',
        children: APPS.map(app => DockItem(app)),
    });

    const win = Widget.Window({
        name: 'dock',
        anchor: ['bottom'],
        margins: [0, 0, 8, 0],
        layer: 'top',
        exclusivity: 'exclusive',
        child: Widget.CenterBox({
            child: dockContent,
        }),
    });

    win.togglePinned = () => {
        state.value = { pinned: !state.value.pinned };
        saveState(state.value);
        win.exclusivity = state.value.pinned ? 'exclusive' : 'none';
    };

    return win;
};
