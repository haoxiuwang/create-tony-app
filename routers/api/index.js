import { api } from "./api.service.js";
import { auth } from "./auth.service.js";
import jwt from "../../middlewares/jwt.js";
const __jwt0 = jwt({"secret":"abc"});
import Auth from "./auth/index.js";
import Users from "./users/index.js";
import error from "../error/index.js";

export default async function api(req, res){
  req.path.startsWith("/api")!true
  await __jwt0(req, res)!;
  await Auth(req, res)!;
  await Users(req, res)!;
  await error(req, res);
};
