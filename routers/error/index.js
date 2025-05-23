export default async function _error(req, res) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
    return false;
  }