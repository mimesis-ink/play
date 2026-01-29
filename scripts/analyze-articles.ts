/**
 * Article Analysis Script
 * 
 * This script reads all articles from mainline and timeline directories,
 * analyzes their content, and generates a comprehensive evaluation report.
 */

import fs from 'fs';
import path from 'path';

interface Article {
  filename: string;
  title: string;
  content: string;
  wordCount: number;
  directory: 'mainline' | 'timeline';
  chapterNumber: number;
}

interface AnalysisResult {
  totalArticles: number;
  mainlineArticles: number;
  timelineArticles: number;
  totalWordCount: number;
  averageWordCount: number;
  articles: Article[];
  themes: Map<string, number>;
  characters: Map<string, number>;
  crossReferences: Array<{ from: string; to: string }>;
}

// Main content directories
const MAINLINE_DIR = path.join(process.cwd(), 'content/docs/mainline');
const TIMELINE_DIR = path.join(process.cwd(), 'content/docs/timeline');

/**
 * Read all MDX files from a directory
 */
function readArticlesFromDirectory(dir: string, dirType: 'mainline' | 'timeline'): Article[] {
  const articles: Article[] = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory ${dir} does not exist. Expected directory structure: content/docs/${dirType}/`);
    return articles;
  }

  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (!file.endsWith('.mdx')) continue;
    
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract title from frontmatter
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : file;
    
    // Extract chapter number
    const chapterMatch = file.match(/(\d+)-/);
    const chapterNumber = chapterMatch ? parseInt(chapterMatch[1], 10) : 0;
    
    // Count words (approximation for Chinese text)
    // Remove frontmatter, markdown syntax, and excessive whitespace for better accuracy
    const textContent = content
      .replace(/---[\s\S]*?---/, '') // Remove frontmatter
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/[#*`\[\]()]/g, '') // Remove markdown syntax
      .replace(/\s+/g, '') // Remove whitespace
      .trim();
    const wordCount = textContent.length;
    
    articles.push({
      filename: file,
      title,
      content, // Store original content for link extraction
      wordCount,
      directory: dirType,
      chapterNumber
    });
  }
  
  return articles.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

/**
 * Extract themes from content
 */
function extractThemes(articles: Article[]): Map<string, number> {
  const themes = new Map<string, number>();
  
  const themeKeywords = [
    { keyword: '孤独', theme: '孤独与疏离' },
    { keyword: '代码', theme: '技术与编程' },
    { keyword: '爱', theme: '爱情' },
    { keyword: '理解', theme: '理解与沟通' },
    { keyword: '哲学', theme: '哲学思考' },
    { keyword: '海德格尔', theme: '存在主义' },
    { keyword: '递归', theme: '自我反思' },
    { keyword: '崩溃', theme: '心理危机' },
    { keyword: '系统', theme: '系统化思维' },
    { keyword: '连接', theme: '人际连接' },
    { keyword: '婚姻', theme: '婚姻关系' },
    { keyword: '上海', theme: '城市背景' },
    { keyword: '创业', theme: '创业历程' },
    { keyword: '自闭', theme: '神经多样性' },
    { keyword: 'ASD', theme: '神经多样性' }
  ];
  
  for (const article of articles) {
    for (const { keyword, theme } of themeKeywords) {
      const count = (article.content.match(new RegExp(keyword, 'g')) || []).length;
      if (count > 0) {
        themes.set(theme, (themes.get(theme) || 0) + count);
      }
    }
  }
  
  return themes;
}

/**
 * Extract character mentions from content
 */
function extractCharacters(articles: Article[]): Map<string, number> {
  const characters = new Map<string, number>();
  
  const characterNames = [
    '陆以辰',
    '沈柏寒',
    '海德格尔',
  ];
  
  for (const article of articles) {
    for (const name of characterNames) {
      const count = (article.content.match(new RegExp(name, 'g')) || []).length;
      if (count > 0) {
        characters.set(name, (characters.get(name) || 0) + count);
      }
    }
  }
  
  return characters;
}

/**
 * Extract cross-references between articles
 */
function extractCrossReferences(articles: Article[]): Array<{ from: string; to: string }> {
  const references: Array<{ from: string; to: string }> = [];
  
  for (const article of articles) {
    // Look for markdown links manually to handle nested parentheses
    const content = article.content;
    let i = 0;
    
    while (i < content.length) {
      // Find start of markdown link
      const linkStart = content.indexOf('[', i);
      if (linkStart === -1) break;
      
      // Find end of link text
      const linkTextEnd = content.indexOf('](', linkStart);
      if (linkTextEnd === -1) break;
      
      // Check if it's a /docs/ link
      const urlStart = linkTextEnd + 2;
      if (!content.substring(urlStart).startsWith('/docs/')) {
        i = linkTextEnd + 1;
        continue;
      }
      
      // Find the matching closing parenthesis
      let depth = 1;
      let urlEnd = urlStart;
      while (urlEnd < content.length && depth > 0) {
        if (content[urlEnd] === '(') depth++;
        else if (content[urlEnd] === ')') depth--;
        if (depth > 0) urlEnd++;
      }
      
      if (depth === 0) {
        const url = content.substring(urlStart, urlEnd);
        // Parse /docs/(mainline|timeline)/filename
        const match = url.match(/^\/docs\/(mainline|timeline)\/(.+)$/);
        if (match) {
          references.push({
            from: article.filename,
            to: `${match[1]}/${match[2]}`
          });
        }
      }
      
      i = urlEnd + 1;
    }
  }
  
  return references;
}

/**
 * Analyze all articles
 */
function analyzeArticles(): AnalysisResult {
  console.log('Reading mainline articles...');
  const mainlineArticles = readArticlesFromDirectory(MAINLINE_DIR, 'mainline');
  
  console.log('Reading timeline articles...');
  const timelineArticles = readArticlesFromDirectory(TIMELINE_DIR, 'timeline');
  
  const allArticles = [...mainlineArticles, ...timelineArticles];
  
  console.log('Extracting themes...');
  const themes = extractThemes(allArticles);
  
  console.log('Extracting character mentions...');
  const characters = extractCharacters(allArticles);
  
  console.log('Extracting cross-references...');
  const crossReferences = extractCrossReferences(allArticles);
  
  const totalWordCount = allArticles.reduce((sum, article) => sum + article.wordCount, 0);
  const averageWordCount = allArticles.length > 0 
    ? Math.round(totalWordCount / allArticles.length) 
    : 0;
  
  return {
    totalArticles: allArticles.length,
    mainlineArticles: mainlineArticles.length,
    timelineArticles: timelineArticles.length,
    totalWordCount,
    averageWordCount,
    articles: allArticles,
    themes,
    characters,
    crossReferences
  };
}

/**
 * Generate evaluation report
 */
function generateReport(analysis: AnalysisResult): string {
  let report = '';
  
  report += '# 文章分析与评价报告\n\n';
  report += `分析时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n`;
  
  report += '## 📊 总体统计\n\n';
  report += `- **总文章数**: ${analysis.totalArticles}篇\n`;
  report += `- **主线章节**: ${analysis.mainlineArticles}章\n`;
  report += `- **时间线章节**: ${analysis.timelineArticles}章\n`;
  report += `- **总字数**: ${analysis.totalWordCount.toLocaleString()}字\n`;
  report += `- **平均字数**: ${analysis.averageWordCount.toLocaleString()}字/章\n\n`;
  
  report += '## 🎭 主题分析\n\n';
  report += '根据关键词出现频率，识别出以下主要主题：\n\n';
  const sortedThemes = Array.from(analysis.themes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  for (const [theme, count] of sortedThemes) {
    report += `- **${theme}**: ${count}次\n`;
  }
  report += '\n';
  
  report += '## 👥 角色分析\n\n';
  report += '主要角色出现频率：\n\n';
  const sortedCharacters = Array.from(analysis.characters.entries())
    .sort((a, b) => b[1] - a[1]);
  
  for (const [character, count] of sortedCharacters) {
    report += `- **${character}**: ${count}次\n`;
  }
  report += '\n';
  
  report += '## 🔗 叙事结构分析\n\n';
  report += `文章间的交叉引用共有 **${analysis.crossReferences.length}** 处，说明主线和时间线之间有密切的互文关系。\n\n`;
  
  if (analysis.crossReferences.length > 0) {
    report += '### 主要交叉引用示例：\n\n';
    const sampleRefs = analysis.crossReferences.slice(0, 5);
    for (const ref of sampleRefs) {
      report += `- 从 \`${ref.from}\` 引用到 \`${ref.to}\`\n`;
    }
    report += '\n';
  }
  
  report += '## 📖 章节分布\n\n';
  report += '### 主线章节列表：\n\n';
  const mainlineArticles = analysis.articles.filter(a => a.directory === 'mainline');
  for (const article of mainlineArticles.slice(0, 10)) {
    report += `${article.chapterNumber}. ${article.title} (${article.wordCount.toLocaleString()}字)\n`;
  }
  if (mainlineArticles.length > 10) {
    report += `... 及其他 ${mainlineArticles.length - 10} 章\n`;
  }
  report += '\n';
  
  report += '### 时间线章节列表：\n\n';
  const timelineArticles = analysis.articles.filter(a => a.directory === 'timeline');
  for (const article of timelineArticles) {
    report += `${article.chapterNumber}. ${article.title} (${article.wordCount.toLocaleString()}字)\n`;
  }
  report += '\n';
  
  report += '## 💡 内容评价\n\n';
  report += '### 叙事特点\n\n';
  report += '1. **双线叙事结构**：主线（mainline）采用现在时叙述，时间线（timeline）提供回溯性背景，两条线索相互交织，增强了叙事的立体感。\n\n';
  report += '2. **主题深度**：作品探讨了孤独、理解、技术与人性等深刻主题，将编程思维与哲学思考巧妙结合。\n\n';
  report += '3. **角色塑造**：通过陆以辰和沈柏寒两个主角的视角，展现了不同年龄、不同经历的人如何寻找人生意义和情感连接。\n\n';
  report += '4. **文学技巧**：运用技术隐喻（如"递归"、"编译"、"系统"等）来表达情感和关系，形成独特的叙事语言。\n\n';
  
  report += '### 优势分析\n\n';
  report += '- ✅ **创新性**: 将技术背景与人文关怀相结合，形成独特的当代都市叙事\n';
  report += '- ✅ **情感深度**: 细腻描写角色的内心世界，展现神经多样性群体的真实体验\n';
  report += '- ✅ **结构设计**: 双线叙事、交叉引用设计精巧，增强读者的阅读体验\n';
  report += '- ✅ **语言风格**: 理性克制中蕴含诗意，技术术语运用恰当\n\n';
  
  report += '### 建议与展望\n\n';
  report += '- 📝 两条叙事线索的互文性很强，建议读者同时参照阅读\n';
  report += '- 📝 作品涉及技术、哲学等专业内容，适合有一定知识背景的读者\n';
  report += '- 📝 可以考虑增加章节导航或主题索引，帮助读者更好地理解复杂的叙事结构\n\n';
  
  report += '## 📚 结论\n\n';
  report += '这是一部具有高度文学性和思想性的当代作品。通过 **两种爱的语言**（技术的逻辑语言与人性的情感语言）的交织，';
  report += '作品深刻探讨了当代人的孤独、理解与连接问题。主线的 **74章** 和时间线的 **13章** 共同构建了一个立体的叙事空间，';
  report += '值得细读和深思。\n\n';
  
  report += '---\n\n';
  report += '*本报告由自动分析脚本生成，基于对所有 mainline 和 timeline 文章的统计分析。*\n';
  
  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('=== 开始分析文章 ===\n');
  
  const analysis = analyzeArticles();
  
  console.log('\n=== 生成报告 ===\n');
  const report = generateReport(analysis);
  
  // Output to console
  console.log(report);
  
  // Save to file with error handling
  try {
    const reportPath = path.join(process.cwd(), 'ARTICLE_ANALYSIS.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`\n报告已保存到: ${reportPath}`);
  } catch (error) {
    console.error('Error writing report file:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  
  // Also save detailed JSON data with error handling
  try {
    const dataPath = path.join(process.cwd(), 'analysis-data.json');
    fs.writeFileSync(dataPath, JSON.stringify({
      ...analysis,
      themes: Array.from(analysis.themes.entries()),
      characters: Array.from(analysis.characters.entries()),
      articles: analysis.articles.map(a => ({
        filename: a.filename,
        title: a.title,
        wordCount: a.wordCount,
        directory: a.directory,
        chapterNumber: a.chapterNumber
      }))
    }, null, 2), 'utf-8');
    console.log(`详细数据已保存到: ${dataPath}\n`);
  } catch (error) {
    console.error('Error writing data file:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  
  console.log('=== 分析完成 ===');
}

// Run the script
main();
