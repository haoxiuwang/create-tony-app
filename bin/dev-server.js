import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createApp } from '../src/generator.js';

let serverProcess = null;

// 启动/重启生成的 app.js
function restartServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }

  console.log('🚀 Starting Tony server...');
  serverProcess = spawn('node', ['app.js'], { stdio: 'inherit' });

  serverProcess.on('close', (code) => {
    if (code && code !== 0) console.error(`Server exited with code ${code}`);
  });
}

// 核心工作流
async function workflow() {
  // 1. 生成代码
  const config = (await import(`./tony.config.js?t=${Date.now()}`)).default;
  createApp(config);
  
  // 2. 重启服务器
  restartServer();
}

// 监听配置变化
fs.watchFile(path.resolve('tony.config.js'), { interval: 500 }, workflow);

// 监听业务代码变化 (routers/middlewares)
// 这里简单监听整个目录，实际可以更精细
fs.watch(path.resolve('routers'), { recursive: true }, () => {
  console.log('📄 Business code changed, restarting...');
  restartServer();
});

workflow();