import { home } from "./home.service.js";
import { getHomeRecommendation } from "./getHomeRecommendation.service.js";
import Books from "./books/index.js";
import Stream from "./stream/index.js";
import User from "./user/index.js";
import error from "./error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function main(req, res) {
  if (req.path.startsWith("/books")) return await Books(req, res);
  if (req.path.startsWith("/stream")) return await Stream(req, res);
  if (req.path.startsWith("/user")) return await User(req, res);

  try {
    return await home(req, res);
  } catch (err) {
    console.error("[Router Error at /]:", err);
    return await error(req, res);
  }
}
