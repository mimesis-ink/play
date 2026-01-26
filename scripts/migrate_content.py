import os
import re
import shutil
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
NEW_VERSION_DIR = os.path.join(BASE_DIR, 'content', 'new_version')
DOCS_DIR = os.path.join(BASE_DIR, 'content', 'docs')

def cnv_upper_num(num_str):
    # Map Chinese numbers to Int
    map_dict = {
        '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
        '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
    }
    # Simple case 1-10
    return map_dict.get(num_str, 0)

def parse_header(line):
    # 1. Main Chapters: "第1章..."
    match_main = re.search(r'^第(\d+)章[:\s]*(.*)', line)
    if match_main:
        return 'main', int(match_main.group(1)), match_main.group(2).strip()
    
    # 2. Retrospect Chapters: "回溯卷·第一章..."
    # Match "回溯卷" then maybe dot, then "第X章"
    match_retro = re.search(r'^回溯卷[·\.]*第([一二三四五六七八九十0-9]+)章[:\s]*(.*)', line)
    if match_retro:
        num_s = match_retro.group(1)
        if num_s.isdigit():
            num = int(num_s)
        else:
            num = cnv_upper_num(num_s)
        return 'retro', num, match_retro.group(2).strip()
        
    return None, None, None

def extract_chapters_from_file(filepath, force_type=None):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    chapters = []
    
    current_chapter = None
    current_content = []
    
    for line in lines:
        type_found, num, title = parse_header(line.strip())
        
        # If force_type is set, we only care about that type OR if it looks like a chapter distinct start
        # Actually for '1-10.txt' it is all 'Main'.
        # For '回溯卷' it is all 'Retro'.
        
        is_new_chapter = False
        if type_found:
             if force_type and type_found == force_type:
                 is_new_chapter = True
             elif not force_type:
                 is_new_chapter = True
                 
        if is_new_chapter:
            if current_chapter:
                current_chapter['content'] = '\n'.join(current_content).strip()
                chapters.append(current_chapter)
            
            # If no title found in header, separate logical handling?
            # Usually strict regex above handles it.
            
            current_chapter = {
                'type': type_found,
                'num': num,
                'title': title if title else f'Chapter {num}',
                'content': '' # We don't include the header line
            }
            current_content = []
            # Add header as H1? No, we do it in MDX generation.
        else:
            if current_chapter:
                current_content.append(line)
            # If no chapter started yet, ignore preamble
            
    if current_chapter:
        current_chapter['content'] = '\n'.join(current_content).strip()
        chapters.append(current_chapter)
        
    return chapters

def process_single_chapter_file(filepath):
    filename = os.path.basename(filepath)
    match = re.search(r'(\d+)', filename)
    if not match:
        return None
    num = int(match.group(1))
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to extract a title from the first few lines
    lines = content.split('\n')
    title = ""
    start_idx = 0
    
    for i in range(min(5, len(lines))):
        line = lines[i].strip()
        _, _, extracted_title = parse_header(line)
        if extracted_title is not None:
            title = extracted_title
            start_idx = i + 1
            break
        elif line.startswith("第") and "章" in line:
             # Fallback
             title = line
             start_idx = i + 1
             break
    
    # Clean content
    body = '\n'.join(lines[start_idx:]).strip()
    
    return {
        'type': 'main',
        'num': num,
        'title': title,
        'content': body
    }

def main():
    print("Starting re-organization...")
    
    vol1_chapters = [] # 1-40
    vol2_chapters = [] # Retro
    vol3_chapters = [] # 41-End
    
    # --- Process Volume 1 Context (1-40) ---
    print("Processing Volume 1 files...")
    # 1. Broad files
    p1 = os.path.join(NEW_VERSION_DIR, '1-10.txt')
    if os.path.exists(p1):
        vol1_chapters.extend(extract_chapters_from_file(p1, 'main'))
        
    p2 = os.path.join(NEW_VERSION_DIR, '11-20.txt')
    if os.path.exists(p2):
        vol1_chapters.extend(extract_chapters_from_file(p2, 'main'))
    
    # 2. Individual files (1-40)
    for f in os.listdir(NEW_VERSION_DIR):
        if not f.endswith('正文.txt') and not f.endswith('章.txt'):
             continue
        if '回溯' in f: continue
        
        match = re.search(r'(\d+)', f)
        if match:
            num = int(match.group(1))
            if 1 <= num <= 40:
                 # Check if we already have it from broad files?
                 # Actually, broad files cover 1-20 usually.
                 # But let's verify.
                 # Strategy: Collect ALL, then dedupe by number. Prefer individual files if overlap?
                 chap = process_single_chapter_file(os.path.join(NEW_VERSION_DIR, f))
                 if chap:
                     vol1_chapters.append(chap)
            elif num >= 41:
                 chap = process_single_chapter_file(os.path.join(NEW_VERSION_DIR, f))
                 if chap:
                     vol3_chapters.append(chap)

    # Dedupe Volume 1
    # Use a dictionary by num
    v1_map = {}
    for c in vol1_chapters:
        v1_map[c['num']] = c
    vol1_sorted = sorted(v1_map.values(), key=lambda x: x['num'])
    
    # Dedupe Volume 3
    v3_map = {}
    for c in vol3_chapters:
        v3_map[c['num']] = c
    vol3_sorted = sorted(v3_map.values(), key=lambda x: x['num'])
    
    # --- Process Volume 2 (Retro) ---
    print("Processing Volume 2 (Retro)...")
    retro_path = os.path.join(NEW_VERSION_DIR, '回溯卷1-10.txt')
    if os.path.exists(retro_path):
        retro_chapters = extract_chapters_from_file(retro_path, 'retro')
        vol2_chapters = sorted(retro_chapters, key=lambda x: x['num'])
    else:
        print("Warning: Retro file not found.")
    
    # --- Write Output ---
    if os.path.exists(DOCS_DIR):
        shutil.rmtree(DOCS_DIR)
    os.makedirs(DOCS_DIR)
    
    # Root Index
    with open(os.path.join(DOCS_DIR, 'index.mdx'), 'w', encoding='utf-8') as f:
        f.write('''---
title: 两种爱的语言
description: 目录
---

# 两种爱的语言

## 第一卷：崩塌与共生 (Collapse and Symbiosis)
微观视角的切片，讲述相遇、确诊与关系的建立。

## 第二卷：时代的洪流 (The Era Torrent)
宏观视角的编年史，回溯过去十年的社会变迁与个人命运。

## 第三卷：未来的重构 (Reconstruction)
面向未来的重建，关于承诺、衰老与永恒。
''')
    
    # Helper to write volume
    def write_volume(folder_name, title, chapters, chapter_prefix="第"):
        path = os.path.join(DOCS_DIR, folder_name)
        os.makedirs(path, exist_ok=True)
        
        pages = []
        for chap in chapters:
            num = chap['num']
            # Slug
            slug = f"{num:02d}-chapter"
            filename = f"{slug}.mdx"
            pages.append(slug)
            
            full_title = chap['title']
            if not full_title: full_title = f"{chapter_prefix} {num} 章"
            
            # Clean title: if it already starts with "第...", don't prefix
            if str(full_title).startswith("第") or str(full_title).startswith("回溯"):
                header_title = full_title
            else:
                header_title = f"第 {num} 章 {full_title}"
            
            content = f"""---
title: {header_title}
description: {header_title}
---

# {header_title}

{chap['content']}
"""
            with open(os.path.join(path, filename), 'w', encoding='utf-8') as f:
                f.write(content)
        
        # Meta
        meta = {
            "title": title,
            "pages": pages
        }
        with open(os.path.join(path, 'meta.json'), 'w', encoding='utf-8') as f:
            json.dump(meta, f, indent=2, ensure_ascii=False)
            
        return folder_name

    # Write Volumes
    # Note: Volume 1 and 3 are standard chapters. Volume 2 is Retrospect.
    
    print(f"Volume 1 Chapters: {len(vol1_sorted)}")
    v1_folder = write_volume('01-collapse-and-symbiosis', '第一卷：崩塌与共生', vol1_sorted)
    
    print(f"Volume 2 Chapters: {len(vol2_chapters)}")
    v2_folder = write_volume('02-era-torrent', '第二卷：时代的洪流', vol2_chapters)
    
    print(f"Volume 3 Chapters: {len(vol3_sorted)}")
    v3_folder = write_volume('03-reconstruction', '第三卷：未来的重构', vol3_sorted)
    
    # Root Meta
    root_meta = {
        "title": "两种爱的语言",
        "root": True,
        "pages": ["index", v1_folder, v2_folder, v3_folder]
    }
    with open(os.path.join(DOCS_DIR, 'meta.json'), 'w', encoding='utf-8') as f:
        json.dump(root_meta, f, indent=2, ensure_ascii=False)

    print("Migration and Reorganization Complete.")

if __name__ == '__main__':
    main()
