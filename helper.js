// tony/helpers.js
export function enhanceRequest(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  req.path = url.pathname;
  req.query = Object.fromEntries(url.searchParams);
  // 可以在这里扩展更多，比如解析 cookie
}

export function enhanceResponse(res) {
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
}