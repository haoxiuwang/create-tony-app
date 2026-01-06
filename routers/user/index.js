import authFn from "../../middlewares/auth.js";
const auth_0 = authFn({"mode":"jwt"});
import { user } from "./user.service.js";
import { getProfile } from "./getProfile.service.js";
import { updateSettings } from "./updateSettings.service.js";
import Signup from "./signup/index.js";
import Library from "./library/index.js";
import error from "./../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function user(req, res) {
  if (await auth_0(req, res) === false) return; // Middleware Break
  if (req.path.startsWith("/user/signup")) return await Signup(req, res);
  if (req.path.startsWith("/user/library")) return await Library(req, res);

  try {
    return await user(req, res);
  } catch (err) {
    console.error("[Router Error at /user]:", err);
    return await error(req, res);
  }
}
