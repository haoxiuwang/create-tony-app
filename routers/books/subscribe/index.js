import { subscribe } from "./subscribe.service.js";
import { setSubcribe } from "./setSubcribe.service.js";
import error from "./../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function subscribe(req, res) {

  try {
    return await subscribe(req, res);
  } catch (err) {
    console.error("[Router Error at /books/subscribe]:", err);
    return await error(req, res);
  }
}
