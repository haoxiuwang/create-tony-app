/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function getCollection(req, res) {
  res.end("Response from getCollection at /api/v1/me/library");
}
