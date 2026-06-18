import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

function collectCssFiles(dir, baseDir = dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectCssFiles(fullPath, baseDir, files);
    } else if (entry.name.endsWith('.css')) {
      files.push({
        path: fullPath,
        name: entry.name,
        size: statSync(fullPath).size,
      });
    }
  }
  return files;
}

function guessComponentName(cssFile) {
  const content = readFileSync(cssFile, 'utf-8');
  if (content.includes('.swc-button')) {
    return 'Button';
  }
  return null;
}

function organizeCss() {
  if (!existsSync(distDir)) {
    console.error('❌ dist 目录不存在，请先执行 npm run build');
    process.exit(1);
  }

  const cssFiles = collectCssFiles(distDir);
  console.log(`📁 找到 ${cssFiles.length} 个 CSS 文件\n`);

  for (const cssFile of cssFiles) {
    const componentName = guessComponentName(cssFile.path);
    if (componentName) {
      const targetDir = join(distDir, 'components', componentName);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }
      const targetPath = join(targetDir, 'style.css');
      copyFileSync(cssFile.path, targetPath);
      console.log(`✅ 已复制: ${basename(cssFile.path)} -> components/${componentName}/style.css`);
    }
  }

  console.log('\n🎨 CSS 文件整理完成！');
  console.log('   按需引入样式示例:');
  console.log("   import 'solid-web-components-ui/dist/components/Button/style.css'");
}

organizeCss();
