export function handleError(err, res) {
  console.error(err);
  if (!res.writableEnded) {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
}
