# dsh-claude-fonts

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 Web / 桌面界面换上 Claude（Anthropic）的字体。

| 部位 | 字体 |
| --- | --- |
| 界面（侧栏、按钮、设置项、菜单） | `Anthropic Sans Web Text` |
| 对话正文与标题（Markdown） | `Anthropic Serif Web Text` |
| 代码块与行内代码 | `Anthropic Mono Variable` |

中文回退到 `Noto Sans SC` / `Source Han Sans SC` / `Noto Serif SC`，都没有则用系统字体。

## 原理

DSH 0.2.x 的排版 token 分两层：

```css
:root {
  --dsh-font-family-text-default: -apple-system, ...;
  --dsw-font-family: var(--dsh-font-family-text-default);
  --dsh-font-family-code-default: "SF Mono", ...;
  --ds-font-family-code: var(--dsh-font-family-code-default);
}

body {
  --dsw-font-family: var(--dsh-font-family-text, var(--dsh-font-family-text-default)),
                     var(--dsh-font-family-text-default);
  --ds-font-family-code: var(--dsh-font-family-code, var(--dsh-font-family-code-default)),
                         var(--dsh-font-family-code-default);
}
```

有两个坑，这个插件都处理了：

**1. 覆盖点是 `--dsh-font-family-text`，不是 `--dsw-font-family`。**
`body` 上的声明优先级高于 `:root`，并且它读的是不带 `-default` 后缀的那个变量。只在 `:root` 写 `--dsw-font-family` 会被 `body` 静默盖掉。

**2. 必须带 `!important`。**
DSH「设置 → 外观」的正文字体 / 代码字体是通过 JS 写到 `body` 的**内联样式**上的。内联样式优先级高于任何 `<style>` 表，所以样式表里的声明必须带 `!important`，否则完全不生效——而且**不会有任何报错**。

除了注入 `<style>`，插件还会用 `body.style.setProperty(..., "important")` 直接写内联变量，把优先级顶到最高一档。DSH 是 SPA，`body` 可能被替换，所以还挂了 `MutationObserver` 重新施加。

Markdown 正文与标题走的是 `font` 简写（`font: var(--dsw-font-markdown-h1)`），字体族已经烧进简写值里，`--dsw-font-markdown-*-font-family` 不再被任何选择器读取。插件按 DSH 自己的 `-font-style` / `-font-weight` / `-font-size` / `-line-height` 分量重建简写，只替换字体族——**字号、行高、字重仍然跟随 DSH 设置**。

## 字体

> **插件不含字体文件。** Anthropic 的这三款字体是专有字体，不随本仓库分发。

需要你自己安装，装好后插件按字体名引用：

| 字体 | 用途 |
| --- | --- |
| `Anthropic Sans Web Text` | 界面 |
| `Anthropic Serif Web Text` | 对话正文 |
| `Anthropic Mono Variable` | 代码 |

Windows 双击 `.ttf` → 安装；macOS 用「字体册」导入。装完刷新页面即可。

没装字体也不会报错，只是会回退到后面的中文 / 系统字体。

## 安装

### 方式一：直接放进 profile

```jsonc
// ~/.dsh/profiles/desktop/package.json
{
  "dependencies": {
    "dsh-claude-fonts": "file:./vendor/dsh-claude-fonts"
  },
  "dsh": {
    "profile": {
      "bundles": [
        // ...
        "dsh-claude-fonts"
      ]
    }
  }
}
```

把本仓库内容放到 `~/.dsh/profiles/desktop/vendor/dsh-claude-fonts/`，然后：

```sh
cd ~/.dsh/profiles/desktop && pnpm install
```

重启 DSH。

### 方式二：从 GitHub 安装

```sh
dsh plugin --profile desktop add "github:<你的用户名>/dsh-claude-fonts"
```

## 验证是否生效

在开发者工具 Console 里：

```js
// 插件是否跑起来了
document.documentElement.getAttribute('data-claude-fonts')   // "on"

// 界面字体
getComputedStyle(document.body).getPropertyValue('--dsw-font-family')  // 含 Anthropic Sans

// 对话正文
getComputedStyle(document.body).getPropertyValue('--dsw-font-serif')   // 含 Anthropic Serif
```

DSH 桌面版的开发者工具是 **`Ctrl + Shift + I`**，不是 F12。

## 卸载

从 `dependencies` 和 `dsh.profile.bundles` 里删掉 `dsh-claude-fonts` 两行，重启即可恢复默认字体。

## 结构

```
dsh-claude-fonts/
├── package.json        插件清单（dsh.client、兼容范围）
├── cordis.patch.yml    bundle 入口行
└── lib/
    ├── client.js       注入字体 CSS（浏览器侧，全部逻辑）
    └── index.js        宿主侧，空的
```

## 兼容性

| 项目 | 值 |
| --- | --- |
| DSH | `>=0.2.0-rc.1 <0.3.0` |
| 验证版本 | 0.2.2-rc.5 |
| Profile | `web` / `desktop` |
| 权限 | 只往 `document.head` 注入一个 `<style>`；不读写文件、不访问网络、不执行命令 |

## 许可

MIT
