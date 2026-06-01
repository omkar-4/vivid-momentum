class SysAPI {
  fs = {
    saveFile: async (path, data) => {
      throw new Error("fs.savefile unmapped");
    },
    readFile: async (path) => {
      throw new Error("fs.readfile unmapped");
    },
    appendFile: async (path, data) => {
      throw new Error("fs.appendFile unmapped");
    },
  };

  window = {
    create: async (url) => {
      throw new Error("window.create unmapped");
    },
    close: async () => {
      throw new Error("window.close unmapped");
    },
  };

  os = {
    execCommand: async (command) => {
      throw new Error("os.execCommand unmapped");
    },
  };
}

class DbAPI {
  init = async () => {
    throw new Error("db.init unmapped");
  };

  // 2. Returns the data (replaces 'query')
  get = () => {
    throw new Error("db.get unmapped");
  };

  // 3. Updates the memory and overwrites the JSON file (replaces 'exec')
  save = async (updatedData) => {
    throw new Error("db.save unmapped");
  };
}

export const db = new DbAPI();
export const sys = new SysAPI();
