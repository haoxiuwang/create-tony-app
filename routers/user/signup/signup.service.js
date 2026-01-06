/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function signup(req, res) {
  // TODO: Implement logic for /user/signup
  res.end("Response from signup at /user/signup");
}
