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

function createServiceFile(filePath, route) {
  if (fs.existsSync(filePath)) return;
  const funcName = path.basename(filePath, ".service.js");
  const template = `async function ${funcName}(req, res) {
  // TODO: implement service logic for ${route}
}
module.exports = { ${funcName} };
`;
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
  const segments = route.split("/").filter(Boolean);
  const routerDir = path.join("routers", ...segments);
  
  const routerFile = path.join(routerDir, "index.js");

  const level = segments.length;
  const routePath = "/" + segments.join("/");

  let middlewares = [];
  let services = [];

  if (Array.isArray(value)) {
    if (value.length === 2) {
      middlewares = value[0]; // array of [moduleName, options?]
      services = value[1];
    }
  }

  const defaultService = segments.length === 0 ? "home" : segments[segments.length - 1];

  const { imports: mwImports, calls: mwCalls } = generateMiddlewareCode(middlewares, level);

  let serviceImports = `const { ${defaultService} } = require("./${defaultService}.service.js");\n`;
  services.forEach(srv => {
    serviceImports += `const { ${srv} } = require("./${srv}.service.js");\n`;
  });

  const children = Object.keys(config.routes).filter(k => {
    return k.startsWith(route + "/") && k.split("/").length === segments.length + 2;
  });

  let childImports = "";
  let childCalls = "";
  children.forEach(child => {
    const name = path.basename(child);
    const alias = pascal(name);
    
    const importPath = `./${name}/index.js`;
    childImports += `const ${alias} = require("${importPath}");\n`;
    childCalls += `  await ${alias}(req, res)!;\n`;
  });
  
  const errorImport = `const error = require("${"../".repeat(level)}${!level?"./":""}error/index.js");\n`;

  const content = `${serviceImports}${mwImports}${childImports}${errorImport}
module.exports = async (req, res) => {
  req.path.startsWith("${routePath}")!true
${mwCalls}${childCalls}  await error(req, res);
};
`;

  writeFile(routerFile, content);

  // Create default + additional service files
  createServiceFile(path.join(routerDir, `${defaultService}.service.js`), routePath);
  services.forEach(srv => {
    createServiceFile(path.join(routerDir, `${srv}.service.js`), routePath);
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
    const segments = route.split("/").filter(Boolean);
    if(segments.length>1)return
    const alias = segments.length === 0 ? "main" : segments[segments.length - 1];
    const importPath = `./routers/${segments.join("/") || "index"}`;
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
});
`;

  writeFile("app.js", appContent);

  // Generate routers
  Object.entries(config.routes).forEach(([route, value]) => {
    createRouter(route, value);
  });
  
  fs.mkdirSync("routers/error")
  const error_code = `export default async function _error(req, res) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
  return false;
}
`
  writeFile("routers/error/index.js",error_code)
  const index_code = `const { home } = require("./home.service.js");
  const error = require("./error/index.js");
  
  module.exports = async (req, res) => {
    req.path=="/"!true
    await error(req, res);
  };
  `
  writeFile("routers/index.js",index_code)
}

// Run generator
createApp(config);

//about.md
