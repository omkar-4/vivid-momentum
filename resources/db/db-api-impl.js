import { sys } from "../api/api.js";
import { db } from "../api/api.js";

const filename = `${NL_DATAPATH}/projects.json`;
const tmpFilename = `${NL_DATAPATH}/projects.json.tmp`;
let projectsBuffer = [];

db.init = async () => {
  try {
    let tmpExists = true;
    await sys.fs.readFile(tmpFilename).catch(() => { tmpExists = false; });

    if (tmpExists) {
      await sys.fs.remove(filename).catch(() => null);
      await sys.fs.move(tmpFilename, filename);
    }

    const data = await sys.fs.readFile(filename);
    projectsBuffer = JSON.parse(data);
  } catch (err) {
    projectsBuffer = [];
  }
};

db.get = () => {
  return projectsBuffer;
};

db.save = async (updatedData) => {
  projectsBuffer = updatedData;
  const jsonString = JSON.stringify(projectsBuffer, null, 2);
  await sys.fs.writeFile(tmpFilename, jsonString);
  await sys.fs.remove(filename).catch(() => null);
  // atomic swap: rename temp to real file
  await sys.fs.move(tmpFilename, filename);
  console.log('success db file')
};

export { db };
