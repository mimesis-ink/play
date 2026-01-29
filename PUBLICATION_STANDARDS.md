# 出版标准检查 (Publication Standards Check)

## 概述 (Overview)

本文档说明如何使用出版标准分析工具来检查 mainline（主线）和 timeline（时间线/回溯卷）中的所有文章是否符合出版标准。

This document explains how to use the publication standards analyzer to check if all articles in mainline and timeline meet publication standards.

## 快速开始 (Quick Start)

运行分析脚本：

```bash
npm run analyze:publication
```

或直接运行：

```bash
node scripts/analyze-publication-standards.js
```

## 出版标准 (Publication Standards)

该脚本会检查以下标准：

### 1. **Frontmatter 检查** (Has Frontmatter)
- 每个 MDX 文件必须包含 YAML frontmatter
- Frontmatter 必须在文件开头，用 `---` 标记包围

```mdx
---
title: "章节标题"
---
```

### 2. **标题检查** (Has Title)
- Frontmatter 中必须包含 `title` 字段
- 标题不能为空

### 3. **章节编号检查** (Valid Chapter Number)
- 主线文章：文件名或标题中必须包含章节编号（如"第1章"、"Chapter 01"）
- 时间线文章：文件名中必须包含"回溯卷"标识

### 4. **内容检查** (Has Content)
- 文件不能为空
- Frontmatter 之后的正文内容至少要有 100 个字符

### 5. **MDX 语法检查** (Valid MDX Syntax)
- 基本的 MDX/JSX 语法验证
- 检查未闭合的标签

### 6. **编码检查** (Proper Encoding)
- 文件必须是 UTF-8 编码
- 文件必须可以正常读取

## 输出示例 (Output Example)

### 全部通过 (All Passed)

```
================================================================================
PUBLICATION STANDARDS ANALYSIS SUMMARY
================================================================================

Total Articles Analyzed: 87
  ✓ Passed: 87 (100.0%)
  ✗ Failed: 0 (0.0%)

Mainline (主线):
  Total: 74
  ✓ Passed: 74
  ✗ Failed: 0

Timeline (时间线/回溯卷):
  Total: 13
  ✓ Passed: 13
  ✗ Failed: 0

================================================================================
✓ All articles meet publication standards!
================================================================================
```

### 发现问题 (Issues Found)

```
================================================================================
Analyzing MAINLINE directory...
================================================================================

✗ 第99章-示例.mdx - FAILED
  ⚠ Missing frontmatter (YAML header between --- markers)
  ⚠ Content too short (50 characters)

================================================================================
PUBLICATION STANDARDS ANALYSIS SUMMARY
================================================================================

Total Articles Analyzed: 75
  ✓ Passed: 74 (98.7%)
  ✗ Failed: 1 (1.3%)

================================================================================
ISSUES FOUND
================================================================================

MAINLINE Issues:

  File: 第99章-示例.mdx
    ⚠ Missing frontmatter (YAML header between --- markers)
    ⚠ Content too short (50 characters)

================================================================================
⚠ 1 article(s) need attention before publication.
================================================================================
```

## 在 CI/CD 中使用 (Using in CI/CD)

该脚本会根据检查结果返回相应的退出码：
- `0`: 所有文章都符合标准
- `1`: 有文章不符合标准

可以在 CI/CD 流程中使用：

```yaml
# .github/workflows/check-publication.yml
name: Check Publication Standards

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run analyze:publication
```

## 目录结构 (Directory Structure)

```
content/
└── docs/
    ├── mainline/          # 主线章节 (74 章)
    │   ├── meta.json
    │   ├── 第1章-二进制的初见.mdx
    │   ├── 第2章-断开连接.mdx
    │   └── ...
    └── timeline/          # 回溯卷章节 (13 章)
        ├── meta.json
        ├── 回溯卷-序章(陆)2015年夏-上海弄堂里的光.mdx
        └── ...
```

## 修复常见问题 (Fixing Common Issues)

### 缺少 Frontmatter

在文件开头添加：

```mdx
---
title: "你的章节标题"
---

文章内容...
```

### 缺少标题

在 frontmatter 中添加 title 字段：

```mdx
---
title: "Chapter XX: 章节标题"
---
```

### 内容太短

确保 frontmatter 之后有足够的正文内容（至少 100 个字符）。

### 章节编号问题

确保文件名或标题中包含正确的章节编号格式：
- 主线：`第X章` 或 `Chapter XX:`
- 时间线：`回溯卷-第X章` 或 `回溯卷·序章`

## 技术细节 (Technical Details)

- **脚本位置**: `scripts/analyze-publication-standards.js`
- **编程语言**: Node.js
- **依赖**: 仅使用 Node.js 内置模块（fs, path）
- **执行时间**: 通常少于 1 秒

## 维护与扩展 (Maintenance and Extension)

如需添加新的检查标准，编辑 `scripts/analyze-publication-standards.js` 文件：

1. 在 `STANDARDS` 对象中添加新标准
2. 在 `analyzeFile()` 函数中实现检查逻辑
3. 更新本文档说明新标准

## 相关文档 (Related Documentation)

- [README.md](./README.md) - 项目总览
- [DOCUMENTATION_STRUCTURE.md](./DOCUMENTATION_STRUCTURE.md) - 文档结构说明
- [RECENT_CHANGES.md](./RECENT_CHANGES.md) - 近期修改记录

## 许可证 (License)

与项目主体相同。
