# Claude AI 设定集文档说明

本文档说明如何使用为 Claude AI 优化的设定集。

## 概述

为了让 Claude 能够高效读取和理解《两种爱的语言》的全部内容，我们创建了专门的设定集文档和API端点。

## 文档结构

### 1. 设定集文档（Appendix）

位于 `/content/docs/appendix/` 目录下：

#### settings.mdx - 世界观与角色设定
包含：
- 基本信息（书名、类型、主题）
- 核心角色详细设定（陆以辰、沈柏寒及配角）
- 完整时间线（2015-2026）
- 核心主题与隐喻
- 叙事特色
- 关键场景
- 象征物
- 文学参考

#### plot-summary.mdx - 剧情梗概
包含：
- 主线卷74章的章节概要
- 回溯卷13章的章节概要
- 阅读建议
- AI阅读优化说明

#### characters.mdx - 角色设定
包含：
- 角色心理动机分析
- 童年创伤
- 价值观形成
- 两人的心理镜像关系

#### timeline-reference.mdx - 时间线参考
包含：
- 前史：时代洪流（2015-2024）
- 正文：幸存者手记（2024.12-2026.02）
- 时代背景与个人事件对照

## API 端点

### /llms-settings.txt
**用途**：获取完整的设定集合（所有 appendix 文档的汇总）

**返回格式**：Markdown

**内容顺序**：
1. settings（世界观与角色设定）
2. plot-summary（剧情梗概）
3. characters（角色设定）
4. timeline-reference（时间线参考）

**使用示例**：
```bash
curl http://localhost:3000/llms-settings.txt
```

### /llms-full.txt
**用途**：获取所有章节的完整内容

**返回格式**：Markdown

**内容**：所有主线、回溯卷、附录章节的文本内容

### /llms.mdx/docs/[[...slug]]
**用途**：获取单个章节的内容

**参数**：slug（章节路径）

**使用示例**：
```bash
# 获取主线第1章
curl http://localhost:3000/llms.mdx/docs/mainline/01-第1章 二进制的初见

# 获取设定集
curl http://localhost:3000/llms.mdx/docs/appendix/settings
```

## Claude 使用建议

### 快速上下文加载

1. **了解基本设定**（推荐首次阅读）：
   ```
   访问 /llms-settings.txt 获取完整设定集
   ```
   这将提供：
   - 世界观和角色背景
   - 完整时间线
   - 章节导读
   - 所有核心设定信息

2. **阅读完整内容**：
   ```
   访问 /llms-full.txt 获取所有章节
   ```

3. **查询特定章节**：
   ```
   访问 /llms.mdx/docs/[section]/[chapter]
   ```

### 信息层次

```
Layer 1 (核心设定) - /llms-settings.txt
├─ 世界观、角色、主题
├─ 时间线框架
└─ 章节导读

Layer 2 (详细内容) - /llms-full.txt
├─ 所有章节完整文本
└─ 叙事细节

Layer 3 (单章查询) - /llms.mdx/docs/[[...slug]]
└─ 特定章节内容
```

## 文档特点

### 为 AI 优化的结构

1. **清晰的层次结构**
   - 使用 Markdown 标题层级
   - 表格对比信息
   - 列表条理化内容

2. **完整的元数据**
   - 角色年龄、时间点精确标注
   - 事件因果关系明确
   - 主题和隐喻系统化

3. **互文性标注**
   - 章节间引用关系
   - 时间线对应关系
   - 主题呼应关系

4. **关键信息提炼**
   - 核心矛盾总结
   - 转折点标注
   - 象征意义说明

## 更新维护

### 添加新章节

1. 在对应目录添加 `.mdx` 文件
2. 更新 `meta.json` 文件
3. 如需要，更新 `plot-summary.mdx` 中的章节概要

### 更新设定

直接编辑 `/content/docs/appendix/` 下的设定文件：
- `settings.mdx` - 世界观和角色设定
- `plot-summary.mdx` - 剧情梗概
- `characters.mdx` - 角色心理分析
- `timeline-reference.mdx` - 时间线

API 端点会自动获取最新内容。

## 技术实现

### 路由结构

```
app/
├── llms-settings.txt/route.ts  # 设定集合 API
├── llms-full.txt/route.ts      # 完整内容 API
└── llms.mdx/docs/[[...slug]]/route.ts  # 单章 API
```

### 数据源

使用 Fumadocs 的 `source` API：
- `source.getPages()` - 获取所有页面
- `page.data.getText('processed')` - 获取处理后的文本
- `page.slugs` - 页面路径
- `page.data.title` - 页面标题

## 示例工作流

### Claude 阅读小说的建议流程

1. **首次接触**：
   ```
   读取 /llms-settings.txt
   → 了解世界观、角色、时间线
   → 建立基本上下文
   ```

2. **深入理解**：
   ```
   根据 plot-summary 选择感兴趣章节
   → 通过 /llms.mdx/docs/[path] 阅读具体章节
   → 或通过 /llms-full.txt 阅读全部
   ```

3. **特定查询**：
   ```
   需要特定信息时查询对应的设定文档：
   - 角色动机 → characters.mdx
   - 时间线 → timeline-reference.mdx
   - 主题隐喻 → settings.mdx
   ```

## 优势

1. **高效上下文加载**：设定集合文档提供结构化的核心信息
2. **分层信息访问**：从概览到详细内容的灵活访问
3. **明确的元数据**：时间、地点、人物关系清晰标注
4. **主题系统化**：隐喻、象征、文学参考完整梳理
5. **可维护性**：文档与内容分离，易于更新

## 访问地址

开发环境：
- 设定集合：http://localhost:3000/llms-settings.txt
- 完整内容：http://localhost:3000/llms-full.txt
- 单章查询：http://localhost:3000/llms.mdx/docs/[section]/[chapter]

生产环境：
- 设定集合：https://[domain]/llms-settings.txt
- 完整内容：https://[domain]/llms-full.txt
- 单章查询：https://[domain]/llms.mdx/docs/[section]/[chapter]
