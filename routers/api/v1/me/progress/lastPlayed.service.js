/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function lastPlayed(req, res) {
  res.end("Response from lastPlayed at /api/v1/me/progress");
}
