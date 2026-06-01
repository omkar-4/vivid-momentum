const rightHandle = document.getElementById("resize-right");
const bottomHandle = document.getElementById("resize-bottom");
const titlebar = document.getElementById("titlebar");

function setTray() {
  // Tray menu is only available in window mode
  if (NL_MODE != "window") {
    console.log("INFO: Tray menu is only available in the window mode.");
    return;
  }

  // Define tray menu items
  let tray = {
    icon: "/resources/icons/appIcon.ico",
    menuItems: [
      { id: "VERSION", text: "Get version" },
      { id: "SEP", text: "-" },
      { id: "QUIT", text: "Quit" },
    ],
  };

  // Set the tray menu
  Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
  switch (event.detail.id) {
    case "VERSION":
      // Display version information
      Neutralino.os.showMessageBox(
        "Version information",
        `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`,
      );
      break;
    case "QUIT":
      // Exit the application
      Neutralino.app.exit();
      break;
  }
}

Neutralino.init();

// ** Hot Reloading **
if (NL_ENVMODE === "dev") {
  Neutralino.events.on("ready", async () => {
    try {
      await Neutralino.events.on("watchFile", (event) => {
        console.log(`File changed: ${event.detail.action}`);
        window.location.reload();
      });
    } catch (err) {
      console.error("Native watcher failed to attach:", err);
    }
  });
}

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);

Neutralino.events.on("windowClose", () => Neutralino.app.exit());

Neutralino.events.on("ready", async () => {
  const icon = "/resources/icons/appIcon.ico";
  await Neutralino.window.setIcon(icon);
  await Neutralino.window.focus();
  await Neutralino.window.setTitle("Vivid Momentum");
});

if (NL_OS != "Darwin") {
  // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
  setTray();
}
