import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 兼容 ESM 的路径获取
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  toPosixPath: (p) => p.split(path.sep).join(path.posix.sep),
  jsDoc: `/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */`
};

/**
 * 生成路由层级逻辑
 */
function createRouter(route, value, config) {
  const segments = route.split("/").filter(Boolean);
  const routerDir = path.join("routers", ...segments);
  const level = segments.length;
  const isRoot = route === "/";
  
  const mName = isRoot ? "main" : segments[level - 1];
  const defaultService = isRoot ? "home" : segments[level - 1];

  // 解析配置: [middlewares, services]
  const [middlewares = [], services = []] = Array.isArray(value) ? value : [[], []];

  let imports = "";
  let calls = "";

  // 1. 处理中间件
  middlewares.forEach(([modPath, options], idx) => {
    const name = path.basename(modPath, ".js");
    const varPrefix = utils.toCamel(name);
    const varName = `${varPrefix}_${idx}`;
    
    // 计算相对导入路径
    const relPath = modPath.startsWith(".") 
      ? utils.toPosixPath(path.join("../".repeat(level + 1), "middlewares", `${name}.js`))
      : modPath;
    
    imports += `import ${varPrefix}Fn from "${relPath}";\n`;
    imports += `const ${varName} = ${varPrefix}Fn(${options ? JSON.stringify(options) : ""});\n`;
    calls += `  if (await ${varName}(req, res) === false) return; // Middleware Break\n`;
  });

  // 2. 处理 Service 导入
  const allServices = Array.from(new Set([defaultService, ...services]));
  allServices.forEach(srv => {
    imports += `import { ${srv} } from "./${srv}.service.js";\n`;
  });

  // 3. 处理子路由分发 (递归匹配)
  const children = Object.keys(config.routes).filter(k => {
    const kSegs = k.split("/").filter(Boolean);
    return k.startsWith(route === "/" ? "/" : route + "/") && kSegs.length === level + 1;
  });

  children.forEach(childPath => {
    const childName = childPath.split("/").filter(Boolean).pop();
    const alias = utils.pascal(childName);
    imports += `import ${alias} from "./${childName}/index.js";\n`;
    calls += `  if (req.path.startsWith("${childPath}")) return await ${alias}(req, res);\n`;
  });

  // 4. 导入兜底错误处理
  const errorRelPath = utils.toPosixPath(path.join("../".repeat(level), "error/index.js"));
  imports += `import error from "./${errorRelPath.replace(/^\.\/\.\./, "..")}";\n`;

  // 5. 生成 index.js
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

  // 6. 生成 *.service.js 模板
  allServices.forEach(srv => {
    const srvFile = path.join(routerDir, `${srv}.service.js`);
    if (!fs.existsSync(srvFile)) {
      utils.writeFile(srvFile, `
${utils.jsDoc}
export async function ${srv}(req, res) {
  // TODO: Implement logic for ${route}
  res.end("Response from ${srv} at ${route}");
}`);
    }
  });
}

/**
 * 主程序入口
 */
export function createApp(config) {
  console.log("🛠️  Generating Tony Framework-less Server...");

  // 1. 生成基础目录
  ["middlewares", "routers", "tony"].forEach(d => utils.ensureDir(d));

  // 2. 生成 app.js 主入口
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

  const appContent = `
${appImports}

http.createServer(async (req, res) => {
  try {
    enhanceRequest(req);
    enhanceResponse(res);
${appCalls}
    await main(req, res);
  } catch (err) {
    handleError(err, res);
  }
}).listen(3000, () => {
  console.log("🚀 Tony server running at http://localhost:3000");
});`;

  utils.writeFile("app.js", appContent);

  // 3. 遍历路由配置生成目录树
  Object.entries(config.routes).forEach(([route, value]) => {
    createRouter(route, value, config);
  });

  // 4. 生成辅助工具类
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

  // 5. 生成 JSConfig 提供 IDE 支持
  utils.writeFile("jsconfig.json", JSON.stringify({
    compilerOptions: { checkJs: true, target: "ESNext", module: "ESNext" },
    exclude: ["node_modules"]
  }, null, 2));
}
