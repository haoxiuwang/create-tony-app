import { issueToken } from "./issueToken.service.js";
import { refreshToken } from "./refreshToken.service.js";
import { revokeToken } from "./revokeToken.service.js";
import error from "../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function auth(req, res) {

  try {
    return await issueToken(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/auth]:", err);
    return await error(req, res);
  }
}
