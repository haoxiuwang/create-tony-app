/**
 * @param {import('http').IncomingMessage & { path: string, query: Object }} req
 * @param {import('http').ServerResponse & { json: Function, status: Function }} res
 */
export async function getInvoices(req, res) {
  res.end("Response from getInvoices at /api/v1/billing");
}
