#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to extract chapter number from filename
function extractChapterNumber(fileName) {
  const match = fileName.match(/chapter[-]?(\d+(?:\.\d+)?)/i);
  return match ? match[1] : null;
}

// Function to update frontmatter title in MDX file
function updateMDXTitle(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract chapter number
    const chapterNum = extractChapterNumber(fileName);
    if (!chapterNum) {
      console.log(`  Skipping ${fileName} - no chapter number found`);
      return false;
    }
    
    // Check if frontmatter exists
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/m);
    if (!frontmatterMatch) {
      console.log(`  Skipping ${fileName} - no frontmatter found`);
      return false;
    }
    
    // Extract current title
    const titleMatch = frontmatterMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (!titleMatch) {
      console.log(`  Skipping ${fileName} - no title in frontmatter`);
      return false;
    }
    
    const currentTitle = titleMatch[1].trim();
    
    // Check if title already has "Chapter X:" prefix
    if (currentTitle.match(/^Chapter\s+\d+/i)) {
      console.log(`  ${fileName}: Already has Chapter prefix`);
      return false;
    }
    
    // Create new title with Chapter prefix
    const newTitle = `Chapter ${chapterNum}: ${currentTitle}`;
    
    // Replace title in content (always quote the value to handle colons in YAML)
    const newContent = content.replace(
      /^(---\s*\n[\s\S]*?^title:\s*)["']?(.+?)["']?(\s*$)/m,
      `$1"${newTitle}"$3`
    );
    
    // Write updated content
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`  ${fileName}: ${currentTitle} -> ${newTitle}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to process all MDX files in a directory
function processMDXFiles(dirPath, dirName) {
  console.log(`\nProcessing ${dirName}:`);
  
  const files = fs.readdirSync(dirPath);
  let updatedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.mdx') && file.startsWith('chapter')) {
      const filePath = path.join(dirPath, file);
      if (updateMDXTitle(filePath, file)) {
        updatedCount++;
      }
    }
  });
  
  console.log(`✓ Updated ${updatedCount} files in ${dirName}`);
  return updatedCount;
}

// Main execution
const docsDir = path.join(__dirname, '../content/docs');

let totalUpdated = 0;

// Process mainline directory
const mainlineDir = path.join(docsDir, 'mainline');
totalUpdated += processMDXFiles(mainlineDir, 'mainline');

// Process timeline directory
const timelineDir = path.join(docsDir, 'timeline');
totalUpdated += processMDXFiles(timelineDir, 'timeline');

// Process appendix directory (if it has chapter files)
const appendixDir = path.join(docsDir, 'appendix');
if (fs.existsSync(appendixDir)) {
  totalUpdated += processMDXFiles(appendixDir, 'appendix');
}

console.log(`\n✓ Total: Updated ${totalUpdated} MDX files!`);
