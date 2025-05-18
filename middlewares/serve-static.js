// middlewares/serveStatic.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime';
import { log } from 'console';

export default function serveStatic( root ) {
    
  return async function serveStaticMiddleware(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return true; // 非静态资源请求，跳过
    }
   
    const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    
    const filePath = path.join(process.cwd(),root, urlPath=="/"?"/index.html":urlPath);
    

    try {
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) return true;

      const range = req.headers.range;
      const contentType = mime.getType(filePath) || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');

      if (range) {
        // 支持 Range 请求（音视频流播放）
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : stat.size - 1;

        if (start >= stat.size || end >= stat.size) {
          res.writeHead(416, {
            'Content-Range': `bytes */${stat.size}`,
          });
          res.end();
          return false;
        }

        const chunkSize = end - start + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Content-Length': chunkSize,
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
        return false;
      }

      res.writeHead(200, {
        'Content-Length': stat.size,
      });

      if (req.method === 'HEAD') {
        res.end();
      } else {
        fs.createReadStream(filePath).pipe(res);
      }

      return false;
    } catch (err) {
      // 文件不存在或无法访问，跳过
      return true;
    }
  };
}
