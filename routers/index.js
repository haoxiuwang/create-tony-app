import { home } from "./home.service.js";
import jwt from "../middlewares/jwt.js";
const __jwt0 = jwt({"secret":"abc"});
import error from "./error/index.js";

export async function handler(req, res){
  req.path=="/"!true
  await __jwt0(req, res)!;
  await error(req, res);
};
