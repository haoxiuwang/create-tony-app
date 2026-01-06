export default async function _error(req, res) {
  res.writeHead(404);
  res.end("404 Not Found");
}
