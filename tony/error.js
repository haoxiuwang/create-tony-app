export function handleError(err, res) {
  console.error("Internal Server Error:", err);
  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Internal Server Error" }));
}
