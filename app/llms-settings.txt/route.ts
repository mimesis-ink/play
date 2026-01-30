import { source } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  // Get all appendix pages that contain settings
  const appendixPages = source.getPages().filter(page => 
    page.slugs[0] === 'appendix'
  );
  
  // Priority order for settings pages
  const priorityOrder = ['settings', 'plot-summary', 'characters', 'timeline-reference'];
  
  // Sort pages by priority
  const sortedPages = appendixPages.sort((a, b) => {
    const aSlug = a.slugs[a.slugs.length - 1];
    const bSlug = b.slugs[b.slugs.length - 1];
    const aIndex = priorityOrder.indexOf(aSlug);
    const bIndex = priorityOrder.indexOf(bSlug);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  // Generate content for each settings page
  const settingsContent = await Promise.all(
    sortedPages.map(async (page) => {
      const content = await page.data.getText('processed');
      return `# ${page.data.title}\n\n${content}`;
    })
  );
  
  // Combine all settings with separators
  const fullSettings = settingsContent.join('\n\n---\n\n');
  
  // Add header with metadata
  const header = `# 《两种爱的语言》设定集合 (Settings Collection)

> 本文档为 Claude AI 优化版本，汇总了小说的所有核心设定信息。
> 
> **包含内容：**
> - 世界观与角色设定
> - 完整剧情梗概（74章主线 + 13章回溯卷）
> - 角色心理分析
> - 时间线参考
>
> **最后更新：** ${new Date().toISOString().split('T')[0]}

---

`;

  return new Response(header + fullSettings, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
