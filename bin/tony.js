#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';
import { createApp } from '../src/generator.js'; // 将之前的逻辑移到这里
import { log } from 'console';

const args = process.argv.slice(2);
const configPath = path.resolve(process.cwd(), 'tony.config.js');

async function loadConfig() {
  // 1. 获取绝对路径
  const absolutePath = path.resolve(process.cwd(), 'tony.config.js');
  
  // 2. 将 C:\... 转换为 file:///C:/...
  const fileUrl = pathToFileURL(absolutePath).href;
  
  try {
    // 3. 加上时间戳缓存消除，动态导入
    const configModule = await import(`${fileUrl}?update=${Date.now()}`);
    return configModule.default;
  } catch (err) {
    console.error('❌ Failed to load config:', err);
    throw err;
  }
}
// 核心执行逻辑
const runGeneration = async () => {
  console.log('🏗️  Generating server structure...');
  try {
    // 动态加载配置（清除 ESM 缓存需要加 query）
    const config = await loadConfig()
    console.log(config);
    
    createApp(config);
    console.log('✅ Structure updated.');
  } catch (err) {
    console.error('❌ Generation failed:', err.message);
  }
};

// 监听模式
if (args.includes('--watch')) {
  console.log('👀 Watching for changes in tony.config.js...');
  fs.watchFile(configPath, { interval: 500 }, () => {
    runGeneration();
  });
}

// 初始化模式
if (args.includes('init')) {
  const template = `export default {
  middlewares: [],
  routes: {
    "/": [[], ["home"]]
  }
};`;
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, template);
    console.log('🆕 Created tony.config.js');
  }
} else {
  runGeneration();
}