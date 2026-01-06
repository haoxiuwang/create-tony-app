import jwtauthFn from "../../../../middlewares/jwtAuth.js";
const jwtauth_0 = jwtauthFn();
import { createOrder } from "./createOrder.service.js";
import { getInvoices } from "./getInvoices.service.js";
import { verifyWebHook } from "./verifyWebHook.service.js";
import error from "../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function billing(req, res) {
  if (await jwtauth_0(req, res) === false) return;

  try {
    return await createOrder(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/billing]:", err);
    return await error(req, res);
  }
}
