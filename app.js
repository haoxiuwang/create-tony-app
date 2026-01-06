import http from "http";
import { enhanceRequest, enhanceResponse } from "./tony/helpers.js";
import { handleError } from "./tony/error.js";
import main from "./routers/index.js";
import corsFn from "./middlewares/cors.js";
const _global_cors_0 = corsFn(undefined);
import bodyparserFn from "./middlewares/bodyParser.js";
const _global_bodyparser_1 = bodyparserFn(undefined);
import ratelimiterFn from "./middlewares/rateLimiter.js";
const _global_ratelimiter_2 = ratelimiterFn({"windowMs":900000,"max":100});

http.createServer(async (req, res) => {
  try {
    enhanceRequest(req);
    enhanceResponse(res);
    if (await _global_cors_0(req, res) === false) return;
    if (await _global_bodyparser_1(req, res) === false) return;
    if (await _global_ratelimiter_2(req, res) === false) return;

    await main(req, res);
  } catch (err) {
    handleError(err, res);
  }
}).listen(config.server?.port || 3000, () => {
  console.log(`🚀 Tony server running at http://localhost:${config.server?.port || 3000}`);
});
