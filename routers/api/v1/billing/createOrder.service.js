/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function createOrder(req, res) {
  res.end("Response from createOrder at /api/v1/billing");
}
