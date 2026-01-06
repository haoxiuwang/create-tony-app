import jwtauthFn from "../../../../middlewares/jwtAuth.js";
const jwtauth_0 = jwtauthFn();
import checksubscriptionFn from "../../../../middlewares/checkSubscription.js";
const checksubscription_1 = checksubscriptionFn();
import { getSignedUrl } from "./getSignedUrl.service.js";
import { getQualityOptions } from "./getQualityOptions.service.js";
import error from "../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function stream(req, res) {
  if (await jwtauth_0(req, res) === false) return;
  if (await checksubscription_1(req, res) === false) return;

  try {
    return await getSignedUrl(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/stream]:", err);
    return await error(req, res);
  }
}
