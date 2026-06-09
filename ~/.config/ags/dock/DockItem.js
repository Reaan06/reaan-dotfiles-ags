import Widget from 'resource:///com/github/Aylurs/ags/widget.js';
import Hyprland from 'resource:///com/github/Aylurs/ags/service/hyprland.js';
import Utils from 'resource:///com/github/Aylurs/ags/utils.js';

const clients = Hyprland.bind("clients");

export const DockItem = (app) => {
    return Widget.Button({
        class_name: 'dock-item',
        on_clicked: () => Utils.execAsync(["bash", "-c", app.exec]),
        child: Widget.Box({
            vertical: true,
            children: [
                Widget.Icon({
                    icon: app.icon,
                    size: 52,
                }),
                Widget.Box({
                    class_name: "dot",
                    visible: app.wm_class ? clients.as(list =>
                        list.some(c => c.class.toLowerCase().includes(app.wm_class))
                    ) : false,
                }),
            ],
        }),
        tooltip_text: app.name,
    });
};
