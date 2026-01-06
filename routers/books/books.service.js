/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function books(req, res) {
  // TODO: Implement logic for /books
  res.end("Response from books at /books");
}
