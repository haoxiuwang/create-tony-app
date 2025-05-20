const fs = require("fs");
const path = require("path");

const config = require("./tony.config");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function pascal(str) {
  return str
    .split(/[^a-zA-Z0-9]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function getModuleName(modPath) {
  return path.basename(modPath).replace(/\.[jt]s$/, "");
}

function isLocal(modPath) {
  return modPath.startsWith(".");
}

function getModuleNameFromRoute(route) {
  return route === "/" ? "index" : route.replace(/^\//, "").replace(/\//g, ".");
}

function createServiceFile(filePath, route) {
  if (fs.existsSync(filePath)) return;
  const funcName = path.basename(filePath, ".service.js");
  const template = `async function ${funcName}(req, res) {
  // TODO: implement service logic for ${route}
}
module.exports = { ${funcName} };`;
  writeFile(filePath, template);
}

function generateMiddlewareCode(middlewares, level) {
  let imports = "";
  let calls = "";

  middlewares.forEach((mwArr, idx) => {
    const [modPath, options] = mwArr;
    const name = getModuleName(modPath);
    const varName = `__${name}${idx}`;
    const importPath = isLocal(modPath)
      ? `${"../".repeat(level)}middlewares/${name}.js`
      : modPath;
    imports += `const ${name} = require("${importPath}");\n`;
    imports += `const ${varName} = ${name}(${options ? JSON.stringify(options) : ""});\n`;
    calls += `  await ${varName}(req, res)!;\n`;
  });

  return { imports, calls };
}

function createRouter(route, value) {
  const isRoot = route === "/";
  const moduleName = getModuleNameFromRoute(route);
  const routerDir = isRoot ? "routers" : path.join("routers", moduleName);
  const routerFile = isRoot ? "routers/index.js" : path.join(routerDir, "index.js");

  const routePath = route;
  let middlewares = [];
  let services = [];

  if (Array.isArray(value)) {
    if (value.length === 2) {
      middlewares = value[0];
      services = value[1];
    }
  }

  const defaultService = isRoot ? "home" : moduleName.split(".").pop();
  const { imports: mwImports, calls: mwCalls } = generateMiddlewareCode(middlewares, 1);

  let serviceImports = `const { ${defaultService} } = require("./${defaultService}.service.js");\n`;
  services.forEach(srv => {
    serviceImports += `const { ${srv} } = require("./${srv}.service.js");\n`;
  });

  const errorImport = isRoot
    ? `const error = require("./error/index.js");\n`
    : `const error = require("../error/index.js");\n`;

  const content = `${serviceImports}${mwImports}${errorImport}
module.exports = async (req, res) => {
  req.path.startsWith("${routePath}")!true
${mwCalls}  await ${defaultService}(req, res)!;
  await error(req, res);
};`;

  writeFile(routerFile, content);

  const servicePath = isRoot
    ? `routers/${defaultService}.service.js`
    : path.join(routerDir, `${defaultService}.service.js`);
  createServiceFile(servicePath, routePath);
  services.forEach(srv => {
    const srvPath = isRoot
      ? `routers/${srv}.service.js`
      : path.join(routerDir, `${srv}.service.js`);
    createServiceFile(srvPath, routePath);
  });
}

function createApp(config) {
  const appMiddlewares = config.middlewares || [];
  const appRoutes = Object.keys(config.routes);

  let imports = `import http from "http";\nimport { enhanceRequest, enhanceResponse } from "./tony/helpers.js";\nimport { handleError } from "./tony/error.js";\n`;
  let calls = `    enhanceRequest(req);\n    enhanceResponse(res);\n\n`;

  appMiddlewares.forEach(([modPath, options], idx) => {
    const name = getModuleName(modPath);
    const varName = `_${name}${idx}`;
    const importPath = isLocal(modPath) ? `./middlewares/${name}.js` : modPath;
    imports += `import ${name} from "${importPath}";\n`;
    imports += `const ${varName} = ${name}(${options ? JSON.stringify(options) : ""});\n`;
    calls += `    await ${varName}(req, res)!;\n`;
  });

  appRoutes.forEach(route => {
    const moduleName = getModuleNameFromRoute(route);
    const alias = moduleName.replace(/\./g, "_");
    const importPath = route === "/"
      ? `./routers/index.js`
      : `./routers/${moduleName}/index.js`;
    imports += `import ${alias} from "${importPath}";\n`;
    calls += `    await ${alias}(req, res)!;\n`;
  });

  imports += `import error from "./routers/error/index.js";\n`;
  calls += `    await error(req, res);\n`;

  const appContent = `${imports}
http.createServer(async (req, res) => {
  try {
${calls}  } catch (err) {
    handleError(err, res);
  }
}).listen(3000, () => {
  console.log("Tony server running at http://localhost:3000");
});`;

  writeFile("app.js", appContent);

  Object.entries(config.routes).forEach(([route, value]) => {
    createRouter(route, value);
  });

  fs.mkdirSync("routers/error", { recursive: true });
  const error_code = `export default async function _error(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
  return false;
}`;
  writeFile("routers/error/index.js", error_code);
}

createApp(config);
