async function updater() {
  try {
    if (typeof Neutralino === "undefined" || !Neutralino.updater) {
      console.error("Neutralino updater module is not loaded. Check permissions config.");
      return;
    }

    // add date now to trick browser to make fresh request every time
    // and not use cached results which causes infinite loop of version mismatch and install + reload app cycle
    let url = "https://raw.githubusercontent.com/omkar-4/vivid-momentum/main/update_manifest.json?v=" + Date.now();
    let manifest = await Neutralino.updater.checkForUpdates(url);

    if (manifest.version != NL_APPVERSION) {
      console.log(`A new version is available!, Latest version: ${manifest.version}, Your version: ${NL_APPVERSION}`);
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
