#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import { createApp } from "../src/generator.js";


const args = process.argv.slice(2);

// 获取 --config 参数
function getArgValue(name) {
  const flag = args.find(a => a.startsWith(`--${name}`));
  if (!flag) return null;
  const [, value] = flag.split("=");
  return value || null;
}

const projectName = args.find(a => !a.startsWith("--")) || "tony-app";
const userConfigPath = getArgValue("config");

if (!userConfigPath) {
  console.error("❌ Missing --config parameter.");
  console.error("Usage: npx create-tony-app <project> --config=./tony.config.js");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), projectName);
fs.mkdirSync(targetDir, { recursive: true });

// 把用户的 config 复制到新项目目录
const destConfigPath = path.join(targetDir, "tony.config.js");
fs.copyFileSync(userConfigPath, destConfigPath);
console.log(`📄 Copied config to ${destConfigPath}`);

// 进入目录执行生成器
process.chdir(targetDir);

async function read_config(){
  
  const config = (await import(pathToFileURL(destConfigPath).href)).default;
  console.log({config});
  createApp(config);
  console.log("🎉 Project created successfully!");
}

read_config()



