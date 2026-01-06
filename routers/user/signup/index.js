import authFn from "../../../middlewares/auth.js";
const auth_0 = authFn({"mode":"jwt"});
import { signup } from "./signup.service.js";
import { setUser } from "./setUser.service.js";
import error from "./../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function signup(req, res) {
  if (await auth_0(req, res) === false) return; // Middleware Break

  try {
    return await signup(req, res);
  } catch (err) {
    console.error("[Router Error at /user/signup]:", err);
    return await error(req, res);
  }
}
