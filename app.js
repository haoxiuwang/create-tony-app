import http from "http";
import { enhanceRequest, enhanceResponse } from "./tony/helpers.js";
import { handleError } from "./tony/error.js";
import main from "./routers/index.js";
import corsFn from "./middlewares/cors.js";
const _global_cors_0 = corsFn({"origin":"*"});
import loggerFn from "./middlewares/logger.js";
const _global_logger_1 = loggerFn({"format":"dev"});


http.createServer(async (req, res) => {
  try {
    enhanceRequest(req);
    enhanceResponse(res);
    if (await _global_cors_0(req, res) === false) return;
    if (await _global_logger_1(req, res) === false) return;

    await main(req, res);
  } catch (err) {
    handleError(err, res);
  }
}).listen(3000, () => {
  console.log("🚀 Tony server running at http://localhost:3000");
});
