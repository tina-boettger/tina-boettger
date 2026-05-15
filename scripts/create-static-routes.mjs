import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");

const routes = [
  "inner-compass",
  "print-summary",
  "for-agents",
  "blog",
  "blog/human-first-ai-machine-consciousness",
  "impressum",
  "legal-notice",
  "datenschutz",
  "privacy",
];

await readFile(indexPath, "utf8");

await Promise.all(
  routes.map(async (route) => {
    const routeDir = path.join(distDir, route);
    await mkdir(routeDir, { recursive: true });
    // FTP hosting often has no SPA fallback, so each public route needs a real file.
    await copyFile(indexPath, path.join(routeDir, "index.html"));
  }),
);

console.log(`Created static entry files for ${routes.length} routes.`);
