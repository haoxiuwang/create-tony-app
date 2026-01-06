/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function removeBook(req, res) {
  res.end("Response from removeBook at /api/v1/me/library");
}
