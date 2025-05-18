import http from "http";
import { enhanceRequest, enhanceResponse } from "./tony/helpers.js";
import { handleError } from "./tony/error.js";
import log from "./middlewares/log.js";
const _log0 = log("c:/a.js");
import cookies from "./middlewares/cookies.js";
const _cookies1 = cookies();
import serveStatic from "./middlewares/serveStatic.js";
const _serveStatic2 = serveStatic("public");
import main from "./routers/index";
import api from "./routers/api";
import auth from "./routers/api/auth";
import users from "./routers/api/users";
import error from "./routers/error/index.js";

http.createServer(async (req, res) => {
  try {
    enhanceRequest(req);
    enhanceResponse(res);

    await _log0(req, res)!;
    await _cookies1(req, res)!;
    await _serveStatic2(req, res)!;
    await main(req, res)!;
    await api(req, res)!;
    await auth(req, res)!;
    await users(req, res)!;
    await error(req, res);
  } catch (err) {
    handleError(err, res);
  }
}).listen(3000, () => {
  console.log("Tony server running at http://localhost:3000");
});
