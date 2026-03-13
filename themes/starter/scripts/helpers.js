"use strict";

/**
 * Hexo 自定义辅助函数
 */

/**
 * 自动扫描文档目录结构
 * 用法: <% const docs = getDocsTree() %>
 * 自动扫描 source/docs 目录，生成树形结构
 */
hexo.extend.helper.register("getDocsTree", function () {
  const pages = this.site.pages.toArray();

  // 筛选出 docs 目录下的页面
  const docPages = pages.filter(function (page) {
    return page.source && page.source.startsWith("docs/");
  });

  if (docPages.length === 0) {
    return [];
  }

  // 构建树形结构
  const tree = {};

  docPages.forEach(function (page) {
    // 解析路径: docs/golang/basics.md -> ['golang', 'basics']
    const source = page.source
      .replace(/^docs\//, "")
      .replace(/\.md$/, "")
      .replace(/\/index$/, "");
    const parts = source.split("/");

    let current = tree;

    parts.forEach(function (part, index) {
      if (!current[part]) {
        current[part] = {
          _children: {},
        };
      }

      // 如果是最后一个部分，添加页面信息
      if (index === parts.length - 1) {
        current[part]._title = page.title || part;
        current[part]._path = page.path;
        current[part]._order = page.order || 999;
      }

      current = current[part]._children;
    });
  });

  // 转换为数组格式
  function toArray(obj, level) {
    const result = [];

    Object.keys(obj).forEach(function (key) {
      const item = obj[key];
      const children = toArray(item._children, level + 1);

      const node = {
        title: item._title || formatTitle(key),
        order: item._order || 999,
      };

      if (item._path) {
        node.path = item._path;
      }

      if (children.length > 0) {
        node.children = children;
      }

      result.push(node);
    });

    // 按 order 排序
    result.sort(function (a, b) {
      return a.order - b.order;
    });

    return result;
  }

  // 格式化目录名为标题
  function formatTitle(name) {
    // 将 kebab-case 或 snake_case 转换为正常标题
    return name.replace(/[-_]/g, " ").replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }

  return toArray(tree, 0);
});

/**
 * 字数统计
 * 用法: <%- wordCount(post.content) %>
 */
hexo.extend.helper.register("wordCount", function (content) {
  if (!content) return 0;

  // 移除 HTML 标签
  const text = content.replace(/<[^>]+>/g, "");
  // 移除多余空白
  const cleanText = text.replace(/\s+/g, "").trim();

  return cleanText.length;
});

/**
 * 阅读时间估算
 * 用法: <%- readingTime(post.content, 300) %>
 */
hexo.extend.helper.register("readingTime", function (content, wordsPerMinute) {
  if (!content) return 0;

  const wpm = wordsPerMinute || 300;
  const text = content.replace(/<[^>]+>/g, "");
  const cleanText = text.replace(/\s+/g, "").trim();
  const minutes = Math.ceil(cleanText.length / wpm);

  return minutes;
});

/**
 * 格式化字数显示
 * 用法: <%- formatWordCount(wordCount) %>
 */
hexo.extend.helper.register("formatWordCount", function (count) {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + "万";
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
});

/**
 * 判断当前路径是否匹配
 * 用法: <%- is_current('/about') %>
 */
hexo.extend.helper.register("is_current", function (path) {
  const currentPath = this.page.path || "";
  const targetPath = path.replace(/^\//, "").replace(/\/$/, "");
  const current = currentPath
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/index\.html$/, "");

  if (targetPath === "") {
    return current === "" || current === "index.html";
  }

  return current.startsWith(targetPath);
});

/**
 * 获取文档导航（上一篇/下一篇）
 * 用法: <% const nav = getDocNav(theme.docs, page.path) %>
 */
hexo.extend.helper.register("getDocNav", function (docs, currentPath) {
  if (!docs || !docs.length) {
    return { prev: null, next: null };
  }

  // 扁平化文档列表
  const flatDocs = [];

  function flatten(items) {
    items.forEach(function (item) {
      if (item.path) {
        flatDocs.push(item);
      }
      if (item.children) {
        flatten(item.children);
      }
    });
  }

  flatten(docs);

  // 查找当前文档位置
  const currentIndex = flatDocs.findIndex(function (doc) {
    return currentPath.includes(doc.path);
  });

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? flatDocs[currentIndex - 1] : null,
    next:
      currentIndex < flatDocs.length - 1 ? flatDocs[currentIndex + 1] : null,
  };
});

/**
 * 截取摘要
 * 用法: <%- excerpt(post.content, 200) %>
 */
hexo.extend.helper.register("excerpt", function (content, length) {
  if (!content) return "";

  const maxLength = length || 200;
  // 移除 HTML 标签
  const text = content.replace(/<[^>]+>/g, "");
  // 移除多余空白
  const cleanText = text.replace(/\s+/g, " ").trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return cleanText.substring(0, maxLength) + "...";
});

/**
 * 相对时间
 * 用法: <%- timeAgo(post.date) %>
 */
hexo.extend.helper.register("timeAgo", function (date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) {
    return diffYear + " 年前";
  } else if (diffMonth > 0) {
    return diffMonth + " 个月前";
  } else if (diffDay > 0) {
    return diffDay + " 天前";
  } else if (diffHour > 0) {
    return diffHour + " 小时前";
  } else if (diffMin > 0) {
    return diffMin + " 分钟前";
  } else {
    return "刚刚";
  }
});

/**
 * 生成唯一 ID
 * 用法: <%- uniqueId('prefix') %>
 */
hexo.extend.helper.register("uniqueId", function (prefix) {
  const random = Math.random().toString(36).substring(2, 9);
  return (prefix || "id") + "-" + random;
});

/**
 * JSON 序列化（用于内联脚本）
 * 用法: <%- jsonStringify(data) %>
 */
hexo.extend.helper.register("jsonStringify", function (data) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
});

/**
 * 获取文章所属的分类路径
 * 用法: <%- getCategoryPath(post.categories) %>
 */
hexo.extend.helper.register("getCategoryPath", function (categories) {
  if (!categories || !categories.length) {
    return [];
  }

  return categories.map(function (cat) {
    return {
      name: cat.name,
      path: cat.path,
    };
  });
});

/**
 * 检查是否有封面图
 * 用法: <% if (hasCover(post)) { %>
 */
hexo.extend.helper.register("hasCover", function (post) {
  return post && post.cover && post.cover.trim() !== "";
});

/**
 * 获取随机颜色（用于标签等）
 * 用法: <%- randomColor(tag.name) %>
 */
hexo.extend.helper.register("randomColor", function (str) {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];

  // 基于字符串生成固定的颜色索引
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
});
