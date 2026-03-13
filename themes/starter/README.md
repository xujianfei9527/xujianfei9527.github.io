# Hexo Theme Starter

一个简洁的 Hexo 主题，支持博客写作和分级文档。

## 功能特点

- 📝 **博客功能** - 文章列表、归档、标签云
- 📚 **分级文档** - 树形侧边栏目录，适合技术文档
- 🔍 **本地搜索** - 基于 JSON 索引的全文搜索
- 📊 **字数统计** - 显示字数和预估阅读时间
- 🏷️ **标签系统** - 文章标签分类
- 🖼️ **图片支持** - 图片懒加载、灯箱效果
- 🌓 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式** - 完美适配移动端

## 安装使用

### 1. 安装主题

将主题文件夹复制到 Hexo 的 `themes` 目录：

```bash
cd your-hexo-site
git clone https://github.com/nijich/hexo-theme-starter.git themes/starter
```

### 2. 启用主题

修改 Hexo 根目录的 `_config.yml`：

```yaml
theme: starter
```

### 3. 配置主题

复制主题配置文件到 Hexo 根目录（推荐）：

```bash
cp themes/starter/_config.yml _config.starter.yml
```

或直接编辑 `themes/starter/_config.yml`。

## 配置说明

### 导航菜单

```yaml
menu:
  首页: /
  归档: /archives
  标签: /tags
  文档: /docs/
  关于: /about
```

### 社交链接

```yaml
social:
  github: https://github.com/username
  twitter: https://twitter.com/username
  email: mailto:your@email.com
```

### 文档目录配置

默认自动扫描，也可以手动指定
```yaml
docs:
  - title: 快速开始
    path: /docs/getting-started
  - title: 指南
    children:
      - title: 安装
        path: /docs/guide/installation
      - title: 配置
        path: /docs/guide/configuration
      - title: 部署
        path: /docs/guide/deployment
  - title: API 参考
    children:
      - title: 核心 API
        path: /docs/api/core
      - title: 插件 API
        path: /docs/api/plugins
```

### 搜索配置

```yaml
search:
  enable: true
  fields:
    - title
    - content
    - tags
  excerpt_length: 100
```

### 字数统计

```yaml
post:
  word_count: true      # 显示字数
  reading_time: true    # 显示阅读时间
  words_per_minute: 300 # 每分钟阅读字数
```

## 创建页面

### 创建标签页

```bash
hexo new page tags
```

编辑 `source/tags/index.md`：

```yaml
---
title: 标签
layout: tags
---
```

### 创建文档页

```bash
hexo new page docs/getting-started
```

编辑 `source/docs/getting-started/index.md`：

```yaml
---
title: 快速开始
layout: doc
---

你的文档内容...
```

## 文章 Front-matter

```yaml
---
title: 文章标题
date: 2024-01-01 12:00:00
updated: 2024-01-02 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类
cover: /images/cover.jpg  # 封面图
toc: true                  # 是否显示目录
---
```

## 图片插入

Markdown 标准语法：

```markdown
![图片描述](/images/example.jpg)
```

支持 Hexo 资源文件夹：

```markdown
{% asset_img example.jpg 图片描述 %}
```

## 代码高亮

主题使用 Hexo 内置的代码高亮，确保 Hexo 配置中启用：

```yaml
# _config.yml
highlight:
  enable: true
  line_number: true
  auto_detect: true
  wrap: true
```

## 自定义样式

可以通过 CSS 变量自定义主题色彩：

```css
/* source/css/custom.css */
:root {
  --primary-color: #your-color;
}
```

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge
- 移动端浏览器

## 开源协议

MIT License
