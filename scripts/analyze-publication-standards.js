#!/usr/bin/env node

/**
 * Publication Standards Analyzer
 * 
 * This script analyzes all MDX articles in mainline and timeline directories
 * to check if they meet publication standards.
 * 
 * Usage: node scripts/analyze-publication-standards.js
 */

const fs = require('fs');
const path = require('path');

// Publication standards criteria
const STANDARDS = {
  HAS_FRONTMATTER: 'has_frontmatter',
  HAS_TITLE: 'has_title',
  VALID_CHAPTER_NUMBER: 'valid_chapter_number',
  HAS_CONTENT: 'has_content',
  VALID_MDX_SYNTAX: 'valid_mdx_syntax',
  PROPER_ENCODING: 'proper_encoding'
};

// Results storage
const results = {
  mainline: {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
  },
  timeline: {
    total: 0,
    passed: 0,
    failed: 0,
    issues: []
  }
};

/**
 * Extract frontmatter from MDX content
 */
function extractFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/m);
  if (!frontmatterMatch) {
    return null;
  }
  
  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*["']?(.+?)["']?\s*$/);
    if (match) {
      frontmatter[match[1]] = match[2];
    }
  }
  
  return frontmatter;
}

/**
 * Extract chapter number from filename or title
 */
function extractChapterNumber(fileName, title) {
  // Try to extract from filename first
  let match = fileName.match(/第(\d+(?:\.\d+)?)章/);
  if (match) {
    return match[1];
  }
  
  // Try to extract from title
  if (title) {
    match = title.match(/第(\d+(?:\.\d+)?)章/);
    if (match) {
      return match[1];
    }
    
    // Also check for "Chapter XX:" format
    match = title.match(/Chapter\s+(\d+(?:\.\d+)?)/i);
    if (match) {
      return match[1];
    }
  }
  
  // For timeline articles, check for different patterns
  match = fileName.match(/回溯卷[·\-](?:序章|第[一二三四五六七八九十\d]+章)/);
  if (match) {
    return 'timeline'; // Valid timeline chapter
  }
  
  return null;
}

/**
 * Analyze a single MDX file
 */
function analyzeFile(filePath, fileName, directory) {
  const issues = [];
  let passed = true;
  
  try {
    // Check file encoding and readability
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (!content || content.trim().length === 0) {
      issues.push({
        standard: STANDARDS.HAS_CONTENT,
        message: 'File is empty'
      });
      passed = false;
    }
    
    // Check for frontmatter
    const frontmatter = extractFrontmatter(content);
    if (!frontmatter) {
      issues.push({
        standard: STANDARDS.HAS_FRONTMATTER,
        message: 'Missing frontmatter (YAML header between --- markers)'
      });
      passed = false;
    } else {
      // Check for title in frontmatter
      if (!frontmatter.title || frontmatter.title.trim().length === 0) {
        issues.push({
          standard: STANDARDS.HAS_TITLE,
          message: 'Missing title in frontmatter'
        });
        passed = false;
      } else {
        // Check for valid chapter numbering
        const chapterNum = extractChapterNumber(fileName, frontmatter.title);
        if (!chapterNum) {
          issues.push({
            standard: STANDARDS.VALID_CHAPTER_NUMBER,
            message: 'Chapter number not found in filename or title'
          });
          passed = false;
        }
      }
    }
    
    // Check for content after frontmatter
    const contentAfterFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
    if (contentAfterFrontmatter.length < 100) {
      issues.push({
        standard: STANDARDS.HAS_CONTENT,
        message: `Content too short (${contentAfterFrontmatter.length} characters)`
      });
      passed = false;
    }
    
    // Basic MDX syntax validation
    // Check for unclosed tags or common syntax errors
    const unclosedTags = content.match(/<([a-zA-Z]+)[^>]*>(?!.*<\/\1>)/g);
    if (unclosedTags && unclosedTags.length > 0) {
      // Filter out self-closing tags and common false positives
      const realIssues = unclosedTags.filter(tag => 
        !tag.endsWith('/>') && !tag.includes('br') && !tag.includes('hr')
      );
      if (realIssues.length > 0) {
        issues.push({
          standard: STANDARDS.VALID_MDX_SYNTAX,
          message: `Potentially unclosed tags detected: ${realIssues.slice(0, 3).join(', ')}`
        });
        // Don't fail on this, just warn
      }
    }
    
  } catch (error) {
    issues.push({
      standard: STANDARDS.PROPER_ENCODING,
      message: `Error reading file: ${error.message}`
    });
    passed = false;
  }
  
  return {
    fileName,
    filePath,
    passed,
    issues
  };
}

/**
 * Analyze all files in a directory
 */
function analyzeDirectory(dirPath, dirName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analyzing ${dirName.toUpperCase()} directory...`);
  console.log(`${'='.repeat(80)}\n`);
  
  const files = fs.readdirSync(dirPath);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));
  
  results[dirName].total = mdxFiles.length;
  
  for (const file of mdxFiles) {
    const filePath = path.join(dirPath, file);
    const result = analyzeFile(filePath, file, dirName);
    
    if (result.passed) {
      results[dirName].passed++;
      console.log(`✓ ${file} - PASSED`);
    } else {
      results[dirName].failed++;
      results[dirName].issues.push(result);
      console.log(`✗ ${file} - FAILED`);
      result.issues.forEach(issue => {
        console.log(`  ⚠ ${issue.message}`);
      });
    }
  }
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('PUBLICATION STANDARDS ANALYSIS SUMMARY');
  console.log(`${'='.repeat(80)}\n`);
  
  const totalArticles = results.mainline.total + results.timeline.total;
  const totalPassed = results.mainline.passed + results.timeline.passed;
  const totalFailed = results.mainline.failed + results.timeline.failed;
  
  console.log(`Total Articles Analyzed: ${totalArticles}`);
  console.log(`  ✓ Passed: ${totalPassed} (${((totalPassed/totalArticles)*100).toFixed(1)}%)`);
  console.log(`  ✗ Failed: ${totalFailed} (${((totalFailed/totalArticles)*100).toFixed(1)}%)`);
  console.log('');
  
  console.log(`Mainline (主线):`);
  console.log(`  Total: ${results.mainline.total}`);
  console.log(`  ✓ Passed: ${results.mainline.passed}`);
  console.log(`  ✗ Failed: ${results.mainline.failed}`);
  console.log('');
  
  console.log(`Timeline (时间线/回溯卷):`);
  console.log(`  Total: ${results.timeline.total}`);
  console.log(`  ✓ Passed: ${results.timeline.passed}`);
  console.log(`  ✗ Failed: ${results.timeline.failed}`);
  console.log('');
  
  if (totalFailed > 0) {
    console.log(`${'='.repeat(80)}`);
    console.log('ISSUES FOUND');
    console.log(`${'='.repeat(80)}\n`);
    
    ['mainline', 'timeline'].forEach(dir => {
      if (results[dir].issues.length > 0) {
        console.log(`\n${dir.toUpperCase()} Issues:`);
        results[dir].issues.forEach(fileResult => {
          console.log(`\n  File: ${fileResult.fileName}`);
          fileResult.issues.forEach(issue => {
            console.log(`    ⚠ ${issue.message}`);
          });
        });
      }
    });
  }
  
  console.log(`\n${'='.repeat(80)}`);
  if (totalFailed === 0) {
    console.log('✓ All articles meet publication standards!');
  } else {
    console.log(`⚠ ${totalFailed} article(s) need attention before publication.`);
  }
  console.log(`${'='.repeat(80)}\n`);
  
  // Return exit code based on results
  return totalFailed === 0 ? 0 : 1;
}

/**
 * Main execution
 */
function main() {
  const docsDir = path.join(__dirname, '../content/docs');
  
  // Check if directories exist
  const mainlineDir = path.join(docsDir, 'mainline');
  const timelineDir = path.join(docsDir, 'timeline');
  
  if (!fs.existsSync(mainlineDir)) {
    console.error(`Error: mainline directory not found at ${mainlineDir}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(timelineDir)) {
    console.error(`Error: timeline directory not found at ${timelineDir}`);
    process.exit(1);
  }
  
  // Analyze directories
  analyzeDirectory(mainlineDir, 'mainline');
  analyzeDirectory(timelineDir, 'timeline');
  
  // Print summary and exit
  const exitCode = printSummary();
  process.exit(exitCode);
}

// Run the script
main();
