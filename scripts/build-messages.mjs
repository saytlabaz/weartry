import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "i18n-src");
const uiDir = path.join(srcDir, "ui");
const outDir = path.join(__dirname, "..", "messages");
fs.mkdirSync(outDir, { recursive: true });

const base = JSON.parse(fs.readFileSync(path.join(srcDir, "base.en.json"), "utf8"));
const az = JSON.parse(fs.readFileSync(path.join(srcDir, "az.json"), "utf8"));

function deepMerge(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === "object" && !Array.isArray(target[key])
    ) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

fs.writeFileSync(path.join(outDir, "en.json"), JSON.stringify(base, null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "az.json"), JSON.stringify(az, null, 2) + "\n");

const uiFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith(".json"));
for (const file of uiFiles) {
  const locale = file.replace(/\.json$/, "");
  const translation = JSON.parse(fs.readFileSync(path.join(uiDir, file), "utf8"));
  const merged = deepMerge(base, translation);
  fs.writeFileSync(path.join(outDir, `${locale}.json`), JSON.stringify(merged, null, 2) + "\n");
}

console.log("Generated locales:", fs.readdirSync(outDir).sort().join(", "));
