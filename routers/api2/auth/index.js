import { auth } from "./auth.service.js";
import error from "../../error/index.js";

export default async function auth(req, res){
  req.path.startsWith("/api2/auth")!true
  await error(req, res);
};
