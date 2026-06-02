const node = figma.currentPage.findOne(n => n.name.includes("TopAppBar"));
if (!node) {
    return "TopAppBar not found";
}
return {
    name: node.name,
    fills: node.fills,
    effects: node.effects,
    cornerRadius: node.cornerRadius,
    padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
    },
    itemSpacing: node.itemSpacing,
    children: node.children.map(c => ({
        name: c.name,
        type: c.type,
        fills: c.fills,
        cornerRadius: c.cornerRadius
    }))
};
