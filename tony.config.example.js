/** @type {import('./tony/types').TonyConfig} */
export default {
  server: {
    port: 3000,
    apiPrefix: "/api/v1" // 逻辑前缀
  },

  // API 专用全局中间件
  middlewares: [
    ["./tony/cors.js"],         // 跨域处理
    ["./tony/bodyParser.js"],   // 解析 JSON Body
    ["./tony/rateLimiter.js", { windowMs: 15 * 60 * 1000, max: 100 }] // 防刷限流
  ],

  routes: {
    // --- 公共资源接口 ---
    "/api/v1/books": {
      services: ["list", "search"],
      middlewares: [["./cache.js", { expire: "10m" }]]
    },

    // 资源详情：在 service 中通过 req.query.id 处理
    "/api/v1/books/detail": {
      services: ["getById", "getChapters", "getRecommendations"]
    },

    // --- 认证与令牌管理 ---
    "/api/v1/auth": {
      services: ["issueToken", "refreshToken", "revokeToken"]
    },

    // --- 需鉴权的用户私有接口 ---
    "/api/v1/me": {
      middlewares: [["./jwtAuth.js"]], // JWT 校验
      services: ["getProfile", "updateProfile"]
    },

    // 播放记录（高频同步）
    "/api/v1/me/progress": {
      middlewares: [["./jwtAuth.js"]],
      services: ["sync", "lastPlayed"]
    },

    // 收藏夹
    "/api/v1/me/library": {
      middlewares: [["./jwtAuth.js"]],
      services: ["addBook", "removeBook", "getCollection"]
    },

    // --- 媒体分发接口 (通常指向 CDN 或云存储签名地址) ---
    "/api/v1/stream": {
      middlewares: [
        ["./jwtAuth.js"],
        ["./checkSubscription.js"] // 检查是否已购买或会员
      ],
      services: ["getSignedUrl", "getQualityOptions"]
    },

    // --- 支付与账单 ---
    "/api/v1/billing": {
      middlewares: [["./jwtAuth.js"]],
      services: ["createOrder", "getInvoices", "verifyWebHook"]
    }
  }
};