import { detail } from "./detail.service.js";
import { getBookDetail } from "./getBookDetail.service.js";
import { getChapters } from "./getChapters.service.js";
import error from "./../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function detail(req, res) {

  try {
    return await detail(req, res);
  } catch (err) {
    console.error("[Router Error at /books/detail]:", err);
    return await error(req, res);
  }
}
