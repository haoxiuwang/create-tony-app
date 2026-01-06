import { library } from "./library.service.js";
import { getMyBooks } from "./getMyBooks.service.js";
import { addFavorite } from "./addFavorite.service.js";
import error from "./../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function library(req, res) {

  try {
    return await library(req, res);
  } catch (err) {
    console.error("[Router Error at /user/library]:", err);
    return await error(req, res);
  }
}
