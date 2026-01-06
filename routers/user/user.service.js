/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function user(req, res) {
  // TODO: Implement logic for /user
  res.end("Response from user at /user");
}
