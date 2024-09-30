import fs from "fs";
import path from "path";

const cacheDir = path.resolve(__dirname, "../../.cache");

const cacheFilePath = (key: string) => path.resolve(cacheDir, `${key}.md`);

const readCache = (key: string) => {
  if (fs.existsSync(cacheFilePath(key))) {
    const cache = fs.readFileSync(cacheFilePath(key), "utf-8");
    return cache;
  }
  return null;
};

const writeCache = (key: string, value: string) => {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  fs.writeFileSync(cacheFilePath(key), value, "utf8");
};

export { readCache, writeCache };
