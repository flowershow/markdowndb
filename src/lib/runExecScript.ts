import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";

export const runExecScript = (scriptPath: string, scriptArgs: string[]) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mddb-exec-"));
  const require = createRequire(import.meta.url);
  const mddbEntry = require.resolve("mddb");
  const loaderPath = path.join(tmpDir, "loader.mjs");
  fs.writeFileSync(
    loaderPath,
    `import { pathToFileURL } from "node:url";
export function resolve(specifier, context, defaultResolve) {
  if (specifier === "mddb") {
    return { url: pathToFileURL(${JSON.stringify(
      mddbEntry
    )}).href, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
`
  );

  const baseUrl = pathToFileURL(process.cwd() + path.sep).href;
  const registerSource = `import { register } from "node:module";
import { pathToFileURL } from "node:url";
register(${JSON.stringify(loaderPath)}, pathToFileURL(${JSON.stringify(
    baseUrl
  )}));
`;
  const registerUrl = `data:text/javascript,${encodeURIComponent(
    registerSource
  )}`;
  const result = spawnSync(
    process.execPath,
    ["--import", registerUrl, scriptPath, ...scriptArgs],
    { stdio: "inherit" }
  );

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (typeof result.status === "number") {
    return result.status;
  }

  return 1;
};
