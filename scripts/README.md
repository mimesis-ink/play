# Scripts

This directory contains utility scripts for managing and analyzing the documentation content.

## Available Scripts

### analyze-articles.ts

Analyzes all articles in the mainline and timeline directories, generating comprehensive statistics and evaluation reports.

**Usage:**

```bash
npx tsx scripts/analyze-articles.ts
```

**What it does:**

- Reads all MDX files from `content/docs/mainline` and `content/docs/timeline`
- Extracts titles, word counts, and chapter information
- Analyzes themes based on keyword frequency
- Tracks character mentions
- Identifies cross-references between articles
- Generates two output files:
  - `ARTICLE_ANALYSIS.md` - Human-readable analysis report
  - `analysis-data.json` - Detailed JSON data for further processing

**Output:**

The generated report includes:
- 📊 Overall statistics (total articles, word counts, etc.)
- 🎭 Theme analysis (keywords and their frequencies)
- 👥 Character analysis (main character mentions)
- 🔗 Narrative structure analysis (cross-references)
- 📖 Chapter distribution
- 💡 Content evaluation and recommendations

### update-mdx-titles.js

Updates titles in MDX files based on frontmatter.

**Usage:**

```bash
node scripts/update-mdx-titles.js
```

### migrate_content.py

Python script for content migration tasks.

**Usage:**

```bash
python scripts/migrate_content.py
```

## Notes

- The `analysis-data.json` file is automatically excluded from git (see `.gitignore`)
- Run the analysis script after making significant content changes to update the report
- All scripts should be run from the repository root directory
