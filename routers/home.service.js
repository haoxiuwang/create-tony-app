/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function home(req, res) {
  // TODO: Implement logic for /
  res.end("Response from home at /");
}
