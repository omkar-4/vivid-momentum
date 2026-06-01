async function updater() {
  try {
    let url = "https://raw.githubusercontent.com/omkar-4/vivid-momentum/main/update_maifest.json";
    let manifest = await Neutralino.updator.checkForUpdates(url);

    if (manifest.version != NL_APPVERSION) {
      await Neutralino.updator.install();
      await Neutralino.app.restartProcess();
    }
  } catch (err) {
    console.error("Update Error", err);
  }
}

updater();
