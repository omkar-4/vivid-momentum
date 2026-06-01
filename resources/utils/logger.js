// import this in every file
// import { logger } from '_relative-path_/utils/logger.js';
import { sys } from "../platform/platform-api-impl.js";

const buffer = [];

function log(level, ...args) {
  // console[level.toLowerCase()]?.(...args);
  buffer.push(`[${level}] ${new Date().toISOString()} ${args.join(" ")}\n`);
}

async function flush() {
  if (!buffer.length) return;
  const lines = buffer.splice(0);
  sys.fs.appendFile("app.log", lines.join(""));
}

if (NL_ENVMODE && NL_ENVMODE === "prod") {
  console.log("PRODUCTION ENV MODE");
  setInterval(flush, 5000);
  window.addEventListener("beforeunload", flush);
}

export const logger = {
  log: (...a) => log("LOG", ...a),
  info: (...a) => log("INFO", ...a),
  error: (...a) => log("ERROR", ...a),
  warn: (...a) => log("WARN", ...a),
};
