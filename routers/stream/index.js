import rangeparserFn from "../../middlewares/rangeParser.js";
const rangeparser_0 = rangeparserFn();
import { stream } from "./stream.service.js";
import { playAudio } from "./playAudio.service.js";
import error from "./../error/index.js";


/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export default async function stream(req, res) {
  if (await rangeparser_0(req, res) === false) return; // Middleware Break

  try {
    return await stream(req, res);
  } catch (err) {
    console.error("[Router Error at /stream]:", err);
    return await error(req, res);
  }
}
