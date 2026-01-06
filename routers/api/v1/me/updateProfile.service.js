/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function updateProfile(req, res) {
  res.end("Response from updateProfile at /api/v1/me");
}
