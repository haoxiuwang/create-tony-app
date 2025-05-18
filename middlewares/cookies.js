export default async function cookies(req, res) {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(pair => {
      const [k, v] = pair.split('=');
      req.cookies[k.trim()] = decodeURIComponent(v);
    });
  }
  return true;
}
