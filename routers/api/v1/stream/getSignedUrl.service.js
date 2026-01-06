/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function getSignedUrl(req, res) {
  res.end("Response from getSignedUrl at /api/v1/stream");
}
