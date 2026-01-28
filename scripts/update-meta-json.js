#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to extract title from MDX file
function extractTitleFromMDX(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Try to extract title from frontmatter
    const frontmatterMatch = content.match(/^---\s*\ntitle:\s*["']?(.+?)["']?\s*\n---/m);
    if (frontmatterMatch && frontmatterMatch[1]) {
      return frontmatterMatch[1].trim();
    }
    
    // If no frontmatter title, try to find first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1]) {
      return h1Match[1].trim();
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
}

// Function to format chapter name
function formatChapterName(fileName, title) {
  // Extract chapter number from filename
  const chapterMatch = fileName.match(/chapter[-]?(\d+(?:\.\d+)?)/i);
  
  if (chapterMatch) {
    const chapterNum = chapterMatch[1];
    if (title) {
      return `Chapter ${chapterNum}: ${title}`;
    } else {
      return `Chapter ${chapterNum}`;
    }
  }
  
  // If it's not a chapter file, just return the title or filename
  return title || fileName;
}

// Function to update meta.json in a directory
function updateMetaJson(dirPath) {
  const metaPath = path.join(dirPath, 'meta.json');
  
  if (!fs.existsSync(metaPath)) {
    console.log(`No meta.json found in ${dirPath}`);
    return;
  }
  
  try {
    // Read current meta.json
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    const meta = JSON.parse(metaContent);
    
    console.log(`\nProcessing: ${dirPath}`);
    console.log(`Current title: ${meta.title}`);
    
    // Check if pages is an array or object
    if (Array.isArray(meta.pages)) {
      // Simple array format - update to object format
      const newPages = {};
      
      meta.pages.forEach(page => {
        const mdxPath = path.join(dirPath, `${page}.mdx`);
        
        if (fs.existsSync(mdxPath)) {
          const title = extractTitleFromMDX(mdxPath);
          const displayName = formatChapterName(page, title);
          newPages[page] = displayName;
          console.log(`  ${page} -> ${displayName}`);
        } else {
          // Keep original if file doesn't exist
          newPages[page] = page;
          console.log(`  ${page} -> ${page} (file not found)`);
        }
      });
      
      meta.pages = newPages;
    } else if (typeof meta.pages === 'object') {
      // Already in object format - update values
      const newPages = {};
      
      Object.keys(meta.pages).forEach(page => {
        const mdxPath = path.join(dirPath, `${page}.mdx`);
        
        if (fs.existsSync(mdxPath)) {
          const title = extractTitleFromMDX(mdxPath);
          const displayName = formatChapterName(page, title);
          newPages[page] = displayName;
          console.log(`  ${page} -> ${displayName}`);
        } else {
          // Keep original if file doesn't exist
          newPages[page] = meta.pages[page];
          console.log(`  ${page} -> ${meta.pages[page]} (file not found)`);
        }
      });
      
      meta.pages = newPages;
    }
    
    // Write updated meta.json with proper formatting
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n', 'utf-8');
    console.log(`✓ Updated ${metaPath}`);
    
  } catch (error) {
    console.error(`Error processing ${metaPath}:`, error.message);
  }
}

// Main execution
const docsDir = path.join(__dirname, '../content/docs');

// Process mainline directory
const mainlineDir = path.join(docsDir, 'mainline');
updateMetaJson(mainlineDir);

// Process timeline directory
const timelineDir = path.join(docsDir, 'timeline');
updateMetaJson(timelineDir);

// Process appendix directory
const appendixDir = path.join(docsDir, 'appendix');
updateMetaJson(appendixDir);

console.log('\n✓ All meta.json files have been updated!');
