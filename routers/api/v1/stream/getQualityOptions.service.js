/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function getQualityOptions(req, res) {
  res.end("Response from getQualityOptions at /api/v1/stream");
}
