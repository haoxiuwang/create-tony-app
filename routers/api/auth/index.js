import { auth } from "./auth.service.js";
import jwt from "jwt";
const __jwt0 = jwt();
import error from "../../error/index.js";

export async function handler(req, res){
  req.path.startsWith("/api/auth")!true
  await __jwt0(req, res)!;
  await error(req, res);
};
