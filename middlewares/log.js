export default async function log(req, res) {  
  console.log(req.method, req.url);
  return true;
}
