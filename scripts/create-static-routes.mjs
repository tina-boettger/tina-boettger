import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStructuredData } from "../src/lib/structured-data.js";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");

const routes = [
  "/",
  "/inner-compass",
  "/print-summary",
  "/for-agents",
  "/blog",
  "/blog/human-first-ai-machine-consciousness",
  "/blog/the-erasure-machine-ai-inherits",
  "/impressum",
  "/legal-notice",
  "/datenschutz",
  "/privacy",
];

const htmlTemplate = await readFile(indexPath, "utf8");
const structuredDataScriptPattern =
  /<script\s+type="application\/ld\+json"\s+data-seo="route-structured-data">[\s\S]*?<\/script>/;

if (!structuredDataScriptPattern.test(htmlTemplate)) {
  throw new Error("Build output does not contain the structured-data script marker.");
}

function scriptTextForRoute(route) {
  const structuredData = getStructuredData(route);
  if (!structuredData) {
    throw new Error(`No structured data is defined for static route '${route}'.`);
  }

  return JSON.stringify(structuredData);
}

function sha256CspToken(text) {
  const digest = createHash("sha256").update(text).digest("base64");
  return `'sha256-${digest}'`;
}

function languageForRoute(route) {
  return route === "/impressum" || route === "/datenschutz" ? "de" : "en";
}

const cspTokens = new Set();

await Promise.all(
  routes.map(async (route) => {
    const scriptText = scriptTextForRoute(route);
    cspTokens.add(sha256CspToken(scriptText));

    const html = htmlTemplate.replace(
      structuredDataScriptPattern,
      `<script type="application/ld+json" data-seo="route-structured-data">${scriptText}</script>`,
    ).replace('<html lang="en">', `<html lang="${languageForRoute(route)}">`);
    const outputPath = route === "/" ? indexPath : path.join(distDir, route.slice(1), "index.html");
    await mkdir(path.dirname(outputPath), { recursive: true });
    // FTP hosting often has no SPA fallback, so each public route needs a real file.
    await writeFile(outputPath, html, "utf8");
  }),
);

const htaccessPath = path.join(distDir, ".htaccess");
const cspMarker = "__JSON_LD_CSP_HASHES__";
let htaccess = await readFile(htaccessPath, "utf8");

if (!htaccess.includes(cspMarker)) {
  throw new Error("The .htaccess CSP template is missing the structured-data hash marker.");
}

const hashList = [...cspTokens].sort().join(" ");
htaccess = htaccess.replace(cspMarker, hashList);

const scriptSrc = htaccess.match(/script-src [^;]+;/)?.[0] ?? "";
if (!scriptSrc || scriptSrc.includes("'unsafe-inline'") || scriptSrc.includes(cspMarker)) {
  throw new Error("Generated script-src policy is missing or permits arbitrary inline scripts.");
}
for (const token of cspTokens) {
  if (!scriptSrc.includes(token)) {
    throw new Error(`Generated CSP is missing structured-data allowance ${token}.`);
  }
}
await writeFile(htaccessPath, htaccess, "utf8");

for (const route of routes) {
  const outputPath = route === "/" ? indexPath : path.join(distDir, route.slice(1), "index.html");
  const html = await readFile(outputPath, "utf8");
  const expected = scriptTextForRoute(route);
  const scriptMatch = html.match(
    /<script\s+type="application\/ld\+json"\s+data-seo="route-structured-data">([\s\S]*?)<\/script>/,
  );

  if (!scriptMatch || scriptMatch[1] !== expected || !scriptSrc.includes(sha256CspToken(scriptMatch[1]))) {
    throw new Error(`Structured-data CSP validation failed for static route '${route}'.`);
  }
  if (!html.includes(`<html lang="${languageForRoute(route)}">`)) {
    throw new Error(`Static language validation failed for route '${route}'.`);
  }
}

console.log(`Created static entry files for ${routes.length - 1} routes with ${cspTokens.size} structured-data CSP hashes.`);
