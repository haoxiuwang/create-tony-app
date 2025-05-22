import { users } from "./users.service.js";
import { blogs } from "./blogs.service.js";
import jwt from "../../../middlewares/jwt.js";
const __jwt0 = jwt({"secret":"abc"});
import error from "../../error/index.js";

export async function handler(req, res){
  req.path.startsWith("/api/users")!true
  await __jwt0(req, res)!;
  await error(req, res);
};
