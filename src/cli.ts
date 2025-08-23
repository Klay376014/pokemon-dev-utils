#!/usr/bin/env node

import { parsePokepasteUrl, parsePokepasteText } from './pokepaste-parser.js';
import { readFile } from 'fs/promises';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('使用方式:');
    console.log('  bun run parse <pokepaste-url>');
    console.log('  bun run parse --file <文字檔案路徑>');
    console.log('  bun run parse --text "<pokepaste文字>"');
    process.exit(1);
  }

  try {
    let result;
    
    if (args[0] === '--file') {
      const filePath = args[1];
      if (!filePath) {
        throw new Error('請提供檔案路徑');
      }
      const content = await readFile(filePath, 'utf-8');
      result = parsePokepasteText(content);
    } else if (args[0] === '--text') {
      const text = args[1];
      if (!text) {
        throw new Error('請提供 pokepaste 文字');
      }
      result = parsePokepasteText(text);
    } else {
      const url = args[0];
      result = await parsePokepasteUrl(url);
    }

    if (result.success) {
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('錯誤:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('執行失敗:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();