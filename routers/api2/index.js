import { api2 } from "./api2.service.js";
import Auth from "./auth/index.js";
import Users from "./users/index.js";
import error from "../error/index.js";

export default async function api2(req, res){
  req.path.startsWith("/api2")!true
  await Auth(req, res)!;
  await Users(req, res)!;
  await error(req, res);
};
