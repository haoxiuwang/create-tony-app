import jwtauthFn from "../../../../middlewares/jwtAuth.js";
const jwtauth_0 = jwtauthFn();
import { getProfile } from "./getProfile.service.js";
import { updateProfile } from "./updateProfile.service.js";
import Progress from "./progress/index.js";
import Library from "./library/index.js";
import error from "../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function me(req, res) {
  if (await jwtauth_0(req, res) === false) return;
  if (req.path.startsWith("/api/v1/me/progress")) return await Progress(req, res);
  if (req.path.startsWith("/api/v1/me/library")) return await Library(req, res);

  try {
    return await getProfile(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/me]:", err);
    return await error(req, res);
  }
}
