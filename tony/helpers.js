import { parse } from "url";
import fs from "fs";
import path from "path";

export function enhanceRequest(req) {
  const parsed = parse(req.url, true);
  req.path = parsed.pathname;
  req.query = parsed.query;
}

export function enhanceResponse(res) {
  res.send = (content) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(content);
  };

  res.json = (data) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  res.sendFile = (filePath) => {
    const absPath = path.resolve(filePath);
    fs.createReadStream(absPath)
      .on("error", () => {
        res.writeHead(404);
        res.end("File not found");
      })
      .pipe(res);
  };
}
