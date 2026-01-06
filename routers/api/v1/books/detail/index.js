import { getById } from "./getById.service.js";
import { getChapters } from "./getChapters.service.js";
import { getRecommendations } from "./getRecommendations.service.js";
import error from "../../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function detail(req, res) {

  try {
    return await getById(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/books/detail]:", err);
    return await error(req, res);
  }
}
