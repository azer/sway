import { addons } from "@storybook/addons";
import { create } from "@storybook/theming";

const XIISeedsTheme = create({
  base: "light",
  brandTitle: "12Seeds",
  brandUrl: "https://12seeds.io",
  brandTarget: "_self",
});

addons.setConfig({
  isFullscreen: false,
  showNav: true,
  showPanel: true,
  panelPosition: "bottom",
  enableShortcuts: true,
  showToolbar: true,
  theme: XIISeedsTheme,
  selectedPanel: undefined,
  initialActive: "sidebar",
  sidebar: {
    showRoots: false,
    collapsedRoots: ["other"],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
