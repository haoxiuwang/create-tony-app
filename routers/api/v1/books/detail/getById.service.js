/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function getById(req, res) {
  res.end("Response from getById at /api/v1/books/detail");
}
