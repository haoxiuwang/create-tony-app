import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 核心工具集
 */
const utils = {
  ensureDir: (dirPath) => fs.mkdirSync(dirPath, { recursive: true }),
  
  writeFile: (filePath, content) => {
    utils.ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content.trim() + "\n");
  },

  pascal: (str) => str.split(/[^a-zA-Z0-9]/).filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1)).join(""),

  toCamel: (str) => str.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').filter(Boolean)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1))
    .join('') || 'module',

  // 关键：统一 ESM 导入路径，必须是 Posix 格式并带后缀
  toImportPath: (p) => {
    let posix = p.split(path.sep).join(path.posix.sep);
    return posix.endsWith('.js') ? posix : `${posix}.js`;
  },

  jsDoc: `/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */`
};

/**
 * 递归生成路由
 */
function createRouter(route, routeConfig, fullConfig) {
  const segments = route.split("/").filter(Boolean);
  const routerDir = path.join("routers", ...segments);
  const level = segments.length;
  const isRoot = route === "/";

  // 优雅的配置解构
  const { 
    middlewares = [], 
    services = [] 
  } = routeConfig;

  const mName = isRoot ? "main" : segments[level - 1];
  const defaultService = services[0] || (isRoot ? "home" : segments[level - 1]);
  const allServices = Array.from(new Set([defaultService, ...services]));

  let imports = "";
  let calls = "";

  // 1. 生成中间件代码
  middlewares.forEach(([modPath, options], idx) => {
    const name = path.basename(modPath, ".js");
    const varPrefix = utils.toCamel(name);
    const varName = `${varPrefix}_${idx}`;
    
    const relPath = modPath.startsWith(".") 
      ? utils.toImportPath(path.join("../".repeat(level + 1), "middlewares", name))
      : modPath;
    
    imports += `import ${varPrefix}Fn from "${relPath}";\n`;
    imports += `const ${varName} = ${varPrefix}Fn(${options ? JSON.stringify(options) : ""});\n`;
    calls += `  if (await ${varName}(req, res) === false) return;\n`;
  });

  // 2. 生成 Service 导入
  allServices.forEach(srv => {
    imports += `import { ${srv} } from "./${srv}.service.js";\n`;
  });

  // 3. 自动查找并生成子路由分发
  const childrenPaths = Object.keys(fullConfig.routes).filter(k => {
    const kSegs = k.split("/").filter(Boolean);
    const baseMatch = k.startsWith(isRoot ? "/" : route + "/");
    return baseMatch && kSegs.length === level + 1;
  });

  childrenPaths.forEach(childPath => {
    const childName = childPath.split("/").filter(Boolean).pop();
    const alias = utils.pascal(childName);
    imports += `import ${alias} from "./${childName}/index.js";\n`;
    calls += `  if (req.path.startsWith("${childPath}")) return await ${alias}(req, res);\n`;
  });

  const errorRelPath = utils.toImportPath(path.join("../".repeat(level), "error/index.js"));
  imports += `import error from "${errorRelPath.startsWith('.') ? errorRelPath : './' + errorRelPath}";\n`;

  // 4. 生成 Router index.js
  const content = `
${imports}

${utils.jsDoc}
export default async function ${mName}(req, res) {
${calls}
  try {
    return await ${defaultService}(req, res);
  } catch (err) {
    console.error("[Router Error at ${route}]:", err);
    return await error(req, res);
  }
}`;

  utils.writeFile(path.join(routerDir, "index.js"), content);

  // 5. 生成 Service 模板
  allServices.forEach(srv => {
    const srvFile = path.join(routerDir, `${srv}.service.js`);
    if (!fs.existsSync(srvFile)) {
      utils.writeFile(srvFile, `
${utils.jsDoc}
export async function ${srv}(req, res) {
  res.end("Response from ${srv} at ${route}");
}`);
    }
  });
}

/**
 * 主构建函数
 */
export function createApp(config) {
 
  
  const root = process.cwd();
  ["middlewares", "routers", "tony"].forEach(d => utils.ensureDir(d));

  // 1. 生成 app.js
  let appImports = `import http from "http";\nimport { enhanceRequest, enhanceResponse } from "./tony/helpers.js";\nimport { handleError } from "./tony/error.js";\nimport main from "./routers/index.js";\n`;
  let appCalls = "";

  (config.middlewares || []).forEach(([modPath, options], idx) => {
    const name = path.basename(modPath, ".js");
    const varPrefix = utils.toCamel(name);
    const varName = `_global_${varPrefix}_${idx}`;
    const impPath = modPath.startsWith(".") ? `./middlewares/${name}.js` : modPath;
    appImports += `import ${varPrefix}Fn from "${impPath}";\nconst ${varName} = ${varPrefix}Fn(${JSON.stringify(options)});\n`;
    appCalls += `    if (await ${varName}(req, res) === false) return;\n`;
  });

  const appContent = `${appImports}
http.createServer(async (req, res) => {
  try {
    enhanceRequest(req);
    enhanceResponse(res);
${appCalls}
    await main(req, res);
  } catch (err) {
    handleError(err, res);
  }
}).listen(config.server?.port || 3000, () => {
  console.log(\`🚀 Tony server running at http://localhost:\${config.server?.port || 3000}\`);
});`;

  utils.writeFile("app.js", appContent);

  // 2. 递归生成所有路由
  Object.entries(config.routes).forEach(([route, routeConfig]) => {
    createRouter(route, routeConfig, config);
  });

  // 3. 生成固定辅助代码 (helpers, error, jsconfig)
  generateHelpers();
}

function generateHelpers() {
  utils.writeFile("tony/helpers.js", `
export function enhanceRequest(req) {
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  req.path = url.pathname;
  req.query = Object.fromEntries(url.searchParams);
}
export function enhanceResponse(res) {
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  res.status = (code) => { res.statusCode = code; return res; };
}`);

  utils.writeFile("tony/error.js", `
export function handleError(err, res) {
  console.error(err);
  if (!res.writableEnded) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}`);

  utils.writeFile("routers/error/index.js", `
export default async function _error(req, res) {
  res.writeHead(404);
  res.end("404 Not Found");
}`);

  utils.writeFile("jsconfig.json", JSON.stringify({
    compilerOptions: { checkJs: true, target: "ESNext", module: "ESNext" },
    exclude: ["node_modules"]
  }, null, 2));
}

/**
 * 启动器：修复 Windows 路径并加载配置
 */
export async function startGenerator() {
  const configPath = path.resolve(process.cwd(), "tony.config.js");
  const fileUrl = pathToFileURL(configPath).href;
  
  try {
    const configModule = await import(`${fileUrl}?update=${Date.now()}`);
    createApp(configModule.default);
  } catch (err) {
    console.error("❌ Generation failed:", err);
  }
}