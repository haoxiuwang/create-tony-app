# Tony Server 🚀

**Tony** 是一个极致轻量、配置驱动的 Node.js Web API 服务器脚手架。它专为追求极致性能和代码纯净度的开发者设计。

与传统框架不同，Tony 坚持 **No TypeScript** 理念，通过 **JSDoc** 提供类型安全，并利用 **静态代码生成** 技术将路由配置转化为物理目录结构，彻底消除运行时的路由查找开销。

---

## 核心特性

* **Zero Framework**: 基于原生 Node.js `http` 模块，无运行时重型框架依赖。
* **Static Routing**: 生成嵌套的 `if-else` 分发逻辑，路由匹配性能接近 $O(1)$。
* **ESM First**: 全面拥抱现代 ES6 模块规范（`import/export`）。
* **JSDoc Powered**: 即使是纯 JS，也能享受完整的 IDE 自动补全和类型检查。
* **Object-Driven Config**: 优雅的对象化路由配置，让 API 结构一目了然。

---

## 项目架构

生成的项目遵循高度解耦的物理分层结构：



* **`/tony`**: 核心助手库。注入 `res.json()`、`res.status()` 等便捷方法。
* **`/middlewares`**: 存放业务中间件（鉴权、限流、日志等）。
* **`/routers`**: 核心路由树。每个文件夹代表一个 API 路径：
    * `index.js`: 自动生成的路由分发器，处理中间件链路和子路由匹配。
    * `*.service.js`: 具体的业务逻辑处理函数。

---

## 快速开始

### 1. 准备环境
确保你的 `package.json` 中配置了 ESM 模式：
```json
{
  "type": "module",
  "scripts": {
    "build": "node generator.js",
    "dev": "node dev-server.js"
  }
}
```

### 2. 定义 API (tony.config.js)
模仿一个真实的 Audiobooks（有声书）API 结构：

```js
export default {
  server: { port: 3000 },
  routes: {
    "/api/v1/books": {
      services: ["list", "search"],
      middlewares: [["./cache.js"]]
    },
    "/api/v1/me/library": {
      middlewares: [["./jwtAuth.js"]],
      services: ["getCollection", "addBook"]
    }
  }
};
```

### 3. 生成与运行

```bash
npm run build   # 静态生成目录与代码
npm run dev     # 启动开发服务器（含热重载）
```

## 开发手册
### 编写 Service
Tony 会自动为你生成带有 JSDoc 的模板，让原生 JS 也能获得强类型提示：

```js
/**
 * @param {import('../../../tony/helpers').EnhancedRequest} req
 * @param {import('../../../tony/helpers').EnhancedResponse} res
 */
export async function list(req, res) {
  // 享受 res.json() 的自动补全
  res.status(200).json({
    success: true,
    data: [{ id: 1, title: "The Great Gatsby" }]
  });
}
```

### 编写中间件
中间件通过返回 false 来实现请求拦截：

```js
export default function auth(options) {
  return async (req, res) => {
    if (!req.headers.authorization) {
      res.status(401).json({ error: "Unauthorized" });
      return false; // 中断链路，不再向下匹配
    }
  };
}
```

## 性能表现
在传统框架中，路由匹配是一个动态正则查找过程。Tony 将其转化为了静态的、预编译的代码分支：

这种方式不仅减少了 CPU 消耗，更使得代码路径变得清晰可查——你可以直接跳转到生成的 index.js 中调试完整的执行链路。

## 许可
MIT

