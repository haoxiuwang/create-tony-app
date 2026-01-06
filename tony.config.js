export default {
  // 全局中间件：跨域、请求日志
  middlewares: [
    ["./cors", { origin: "*" }],
    ["./logger", { format: "dev" }]
  ],
  
  routes: {
    // 首页：获取推荐书籍
    "/": [[], ["getHomeRecommendation"]],

    // 书籍库：列表分片与详情
    "/books": [[], ["listBooks", "search"]],
    
    // 书籍详情（带 ID）
    "/books/detail": [[], ["getBookDetail", "getChapters"]],

    // 书籍订阅（带 ID）
    "/books/subscribe": [[], [ "setSubcribe"]],
    // 音频流处理：需要专门的性能处理中间件
    "/stream": [
      [ ["./rangeParser", null] ], // 解析 HTTP Range 请求，支持音频拖动
      ["playAudio"]
    ],

    // 用户中心：需要鉴权中间件
    "/user": [
      [ ["./auth", { mode: "jwt" }] ], // 该路由及其子路由全部受保护
      ["getProfile", "updateSettings"]
    ],

    "/user/signup":[
      [["./auth", { mode: "jwt" }]],
      ["setUser"]
    ],

    // 用户书架
    "/user/library": [[], ["getMyBooks", "addFavorite"]]
  }
};