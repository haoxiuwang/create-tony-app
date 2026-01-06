import jwtauthFn from "../../../../../middlewares/jwtAuth.js";
const jwtauth_0 = jwtauthFn();
import { sync } from "./sync.service.js";
import { lastPlayed } from "./lastPlayed.service.js";
import error from "../../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function progress(req, res) {
  if (await jwtauth_0(req, res) === false) return;

  try {
    return await sync(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/me/progress]:", err);
    return await error(req, res);
  }
}
