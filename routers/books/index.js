import { books } from "./books.service.js";
import { listBooks } from "./listBooks.service.js";
import { search } from "./search.service.js";
import Detail from "./detail/index.js";
import Subscribe from "./subscribe/index.js";
import error from "./../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function books(req, res) {
  if (req.path.startsWith("/books/detail")) return await Detail(req, res);
  if (req.path.startsWith("/books/subscribe")) return await Subscribe(req, res);

  try {
    return await books(req, res);
  } catch (err) {
    console.error("[Router Error at /books]:", err);
    return await error(req, res);
  }
}
