export function enhanceRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  req.path = url.pathname;
  req.query = Object.fromEntries(url.searchParams);
}
export function enhanceResponse(res) {
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  res.status = (code) => { res.statusCode = code; return res; };
}
