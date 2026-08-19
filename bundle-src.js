import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const outputFile = path.join(process.cwd(), 'all_code.txt');

function readDirRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(readDirRecursive(filePath));
    } else {
      // فقط فایل‌های کدی خوانده شوند
      if (/\.(js|jsx|ts|tsx|css|json)$/i.test(file)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

const allFiles = readDirRecursive(srcDir);
let combinedText = '';

allFiles.forEach((filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  combinedText += `\n\n========================================\n`;
  combinedText += `FILE: ${relativePath}\n`;
  combinedText += `========================================\n\n`;
  combinedText += content;
});

fs.writeFileSync(outputFile, combinedText, 'utf-8');
console.log(`تمام کدها با موفقیت در فایل ${outputFile} ذخیره شدند!`);