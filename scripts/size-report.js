import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname, relative, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const reportDir = join(rootDir, 'size-reports');

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFiles(dir, baseDir = dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      getFiles(fullPath, baseDir, files);
    } else {
      if (relPath.endsWith('stats.html')) continue;
      if (relPath.startsWith('assets/') && relPath.endsWith('.css')) continue;
      const stats = statSync(fullPath);
      const content = readFileSync(fullPath);
      const gzipped = gzipSync(content);
      files.push({
        path: relPath,
        size: stats.size,
        gzipSize: gzipped.length,
        ext: extname(entry.name).slice(1),
        name: entry.name,
      });
    }
  }
  return files;
}

function categorizeFiles(files) {
  const categories = {
    core: { label: '核心包', files: [], totalSize: 0, totalGzipSize: 0 },
    components: { label: '组件', files: [], totalSize: 0, totalGzipSize: 0 },
    icons: { label: '图标', files: [], totalSize: 0, totalGzipSize: 0 },
    styles: { label: '样式', files: [], totalSize: 0, totalGzipSize: 0 },
    shared: { label: '共享代码', files: [], totalSize: 0, totalGzipSize: 0 },
    types: { label: '类型声明', files: [], totalSize: 0, totalGzipSize: 0 },
    other: { label: '其他', files: [], totalSize: 0, totalGzipSize: 0 },
  };

  for (const file of files) {
    let category = 'other';

    if (file.path.startsWith('assets/') && file.ext === 'css') {
      continue;
    }

    if (file.ext === 'css') {
      category = 'styles';
    } else if (file.ext === 'd.ts' || file.path.endsWith('.d.ts')) {
      category = 'types';
    } else if (file.path.startsWith('components/')) {
      if (file.path.endsWith('.css')) {
        category = 'styles';
      } else {
        category = 'components';
      }
    } else if (file.path.startsWith('icons/') || file.name.startsWith('icons.') || file.path === 'icons') {
      category = 'icons';
    } else if (file.path.startsWith('shared/')) {
      category = 'shared';
    } else if (file.name === 'index.es.js' || file.name === 'index.cjs.js' || file.name === 'index.d.ts') {
      if (file.path === 'index.es.js' || file.path === 'index.cjs.js' || file.path === 'index.d.ts') {
        category = 'core';
      } else if (file.path.startsWith('icons/')) {
        category = 'icons';
      }
    }

    if (category !== 'other' || !file.path.startsWith('assets/')) {
      categories[category].files.push(file);
      categories[category].totalSize += file.size;
      categories[category].totalGzipSize += file.gzipSize;
    }
  }

  return categories;
}

function getPreviousReport() {
  if (!existsSync(reportDir)) return null;
  const files = readdirSync(reportDir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();
  if (files.length < 2) return null;
  const prevFile = join(reportDir, files[1]);
  return JSON.parse(readFileSync(prevFile, 'utf-8'));
}

function generateReport() {
  if (!existsSync(distDir)) {
    console.error('❌ dist 目录不存在，请先执行 npm run build');
    process.exit(1);
  }

  const files = getFiles(distDir);
  const categories = categorizeFiles(files);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalGzipSize = files.reduce((sum, f) => sum + f.gzipSize, 0);

  const report = {
    timestamp: new Date().toISOString(),
    totalSize,
    totalGzipSize,
    fileCount: files.length,
    categories: {},
  };

  for (const [key, cat] of Object.entries(categories)) {
    report.categories[key] = {
      label: cat.label,
      totalSize: cat.totalSize,
      totalGzipSize: cat.totalGzipSize,
      fileCount: cat.files.length,
      files: cat.files.map((f) => ({
        path: f.path,
        size: f.size,
        gzipSize: f.gzipSize,
      })),
    };
  }

  const prevReport = getPreviousReport();

  console.log('\n' + '='.repeat(70));
  console.log('📦  Solid Web Components UI - 包体积分析报告');
  console.log('='.repeat(70));
  console.log(`\n生成时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`文件总数: ${files.length}`);
  console.log(`\n总大小: ${formatSize(totalSize)} (gzip: ${formatSize(totalGzipSize)})`);

  if (prevReport) {
    const diff = totalSize - prevReport.totalSize;
    const diffPercent = ((diff / prevReport.totalSize) * 100).toFixed(2);
    const sign = diff >= 0 ? '+' : '';
    console.log(`  较上次: ${sign}${formatSize(diff)} (${sign}${diffPercent}%)`);
  }

  console.log('\n' + '-'.repeat(70));
  console.log('📊  分类统计');
  console.log('-'.repeat(70));

  const sortedCategories = Object.entries(report.categories).sort(
    (a, b) => b[1].totalSize - a[1].totalSize
  );

  for (const [key, cat] of sortedCategories) {
    if (cat.fileCount === 0) continue;

    let diffStr = '';
    if (prevReport && prevReport.categories[key]) {
      const diff = cat.totalSize - prevReport.categories[key].totalSize;
      const diffPercent = prevReport.categories[key].totalSize
        ? ((diff / prevReport.categories[key].totalSize) * 100).toFixed(2)
        : '0.00';
      const sign = diff >= 0 ? '+' : '';
      diffStr = `  [${sign}${formatSize(diff)}]`;
    }

    console.log(
      `\n${cat.label} (${cat.fileCount} 个文件):`
    );
    console.log(
      `  原始大小: ${formatSize(cat.totalSize)}  |  gzip: ${formatSize(cat.totalGzipSize)}${diffStr}`
    );

    const topFiles = [...cat.files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    for (const file of topFiles) {
      console.log(`    - ${file.path}: ${formatSize(file.size)} (gzip: ${formatSize(file.gzipSize)})`);
    }
  }

  console.log('\n' + '-'.repeat(70));
  console.log('🔍  体积最大的 10 个文件');
  console.log('-'.repeat(70));

  const top10 = [...files].sort((a, b) => b.size - a.size).slice(0, 10);
  for (let i = 0; i < top10.length; i++) {
    const file = top10[i];
    console.log(
      `  ${String(i + 1).padStart(2)}. ${file.path} - ${formatSize(file.size)} (gzip: ${formatSize(file.gzipSize)})`
    );
  }

  console.log('\n' + '='.repeat(70));
  console.log('💡  提示: 运行 npm run build 后再执行此命令获取最新数据');
  console.log('📈  可视化报告: dist/stats.html (仅本地，不发布到 npm)');
  console.log('='.repeat(70) + '\n');

  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = join(reportDir, `size-report-${Date.now()}.json`);
  writeFileSync(reportFile, JSON.stringify(report, null, 2));

  const latestFile = join(reportDir, 'latest.json');
  writeFileSync(latestFile, JSON.stringify(report, null, 2));

  console.log(`📄 详细报告已保存: ${relative(rootDir, reportFile)}`);
  console.log(`📄 最新报告: ${relative(rootDir, latestFile)}\n`);
}

generateReport();
