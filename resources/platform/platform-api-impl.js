import { sys } from "../api/api.js";

sys.os.execCommand = async (command) => Neutralino.os.execCommand(command);
sys.fs.readFile = async (path) => Neutralino.filesystem.readFile(path);
sys.fs.appendFile = async (path, data) =>
  await Neutralino.filesystem.appendFile(path, data);
sys.fs.move = async (src, dst) => await Neutralino.filesystem.move(src, dst);
sys.fs.remove = async (path) => await Neutralino.filesystem.remove(path);
sys.fs.writeFile = async (path, content) => await Neutralino.filesystem.writeFile(path, content);

export { sys };
