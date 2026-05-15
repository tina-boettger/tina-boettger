const ROUTES = new Set([
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
]);

function stripTrailingSlash(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function getAppBasePath() {
  const viteBase = import.meta.env.BASE_URL;

  if (viteBase && viteBase !== "/" && viteBase !== "./") {
    return stripTrailingSlash(viteBase.startsWith("/") ? viteBase : `/${viteBase}`);
  }

  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]');
  if (!script?.src) {
    return "";
  }

  const scriptPath = new URL(script.src).pathname;
  const assetsIndex = scriptPath.lastIndexOf("/assets/");
  if (assetsIndex <= 0) {
    return "";
  }

  return stripTrailingSlash(scriptPath.slice(0, assetsIndex));
}

export function normalizeRoutePath(pathname = window.location.pathname) {
  const basePath = getAppBasePath();
  let routePath = pathname;

  if (basePath && (routePath === basePath || routePath.startsWith(`${basePath}/`))) {
    routePath = routePath.slice(basePath.length) || "/";
  }

  routePath = stripTrailingSlash(routePath);
  return ROUTES.has(routePath) ? routePath : routePath;
}

export function appHref(path: string) {
  const basePath = getAppBasePath();
  const normalizedPath = stripTrailingSlash(path.startsWith("/") ? path : `/${path}`);

  if (!basePath) {
    return normalizedPath;
  }

  return normalizedPath === "/" ? `${basePath}/` : `${basePath}${normalizedPath}`;
}

export function appAssetUrl(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }

  const basePath = getAppBasePath();
  return `${basePath}${path}`;
}

export function navigateToAppPath(path: string) {
  const targetHref = appHref(path);

  if (normalizeRoutePath() === stripTrailingSlash(path)) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  window.history.pushState({}, "", targetHref);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
