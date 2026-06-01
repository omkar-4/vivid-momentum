async function updater() {
  try {
    if (typeof Neutralino === "undefined" || !Neutralino.updater) {
      console.error("Neutralino updater module is not loaded. Check permissions config.");
      return;
    }

    let url = "https://raw.githubusercontent.com/omkar-4/vivid-momentum/main/update_manifest.json";
    let manifest = await Neutralino.updater.checkForUpdates(url);

    if (manifest.version != NL_APPVERSION) {
      await Neutralino.updater.install();
      await Neutralino.app.restartProcess();
    } else {
      console.log("You are using the latest version!");
    }
  } catch (err) {
    console.error("Update Error", err);
  }
}

updater();
