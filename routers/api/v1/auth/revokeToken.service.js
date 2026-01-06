/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function revokeToken(req, res) {
  res.end("Response from revokeToken at /api/v1/auth");
}
