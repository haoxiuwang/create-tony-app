import jwtauthFn from "../../../../../middlewares/jwtAuth.js";
const jwtauth_0 = jwtauthFn();
import { addBook } from "./addBook.service.js";
import { removeBook } from "./removeBook.service.js";
import { getCollection } from "./getCollection.service.js";
import error from "../../../../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function library(req, res) {
  if (await jwtauth_0(req, res) === false) return;

  try {
    return await addBook(req, res);
  } catch (err) {
    console.error("[Router Error at /api/v1/me/library]:", err);
    return await error(req, res);
  }
}
