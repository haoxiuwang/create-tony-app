import { users } from "./users.service.js";
import { blogs } from "./blogs.service.js";
import error from "../../error/index.js";

export default async function users(req, res){
  req.path.startsWith("/api2/users")!true
  await error(req, res);
};
