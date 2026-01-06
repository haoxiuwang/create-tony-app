import cacheFn from "../../../../middlewares/cache.js";
const cache_0 = cacheFn({"expire":"10m"});
import { list } from "./list.service.js";
import { search } from "./search.service.js";
import Detail from "./detail/index.js";
import error from "../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function books(req, res) {
  if (await cache_0(req, res) === false) return;
  if (req.path.startsWith("/api/v1/books/detail")) return await Detail(req, res);

  try {
    return await list(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/books]:", err);
    return await error(req, res);
  }
}
