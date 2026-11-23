# dsh-claude-fonts

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 换上 Claude 的字体。

| 部位 | 字体 |
| --- | --- |
| 界面（侧栏、按钮、设置） | `Anthropic Sans Web Text` |
| 对话正文与标题 | `Anthropic Serif Web Text` |
| 代码 | `Anthropic Mono Variable` |

中文回退到 Noto / 思源，再没有就用系统字体。

## 字体

插件**不含字体文件**——这三款是 Anthropic 的专有字体，需自行安装。Windows 双击 `.ttf` 安装，装完刷新页面。

没装也不报错，只是会回退到后面的字体。

## 安装

把本仓库放到 `~/.dsh/profiles/desktop/vendor/dsh-claude-fonts/`，然后：

```jsonc
// ~/.dsh/profiles/desktop/package.json
{
  "dependencies": { "dsh-claude-fonts": "file:./vendor/dsh-claude-fonts" },
  "dsh": { "profile": { "bundles": [ "dsh-claude-fonts" ] } }
}
```

```sh
cd ~/.dsh/profiles/desktop && pnpm install
```

重启 DSH。

## 两个坑

改 DSH 字体容易踩这两个，插件都处理了：

1. **覆盖点是 `--dsh-font-family-text`**，不是 `--dsw-font-family`。DSH 在 `body` 上重新定义了后者，会盖掉 `:root`。
2. **必须带 `!important`**。「设置 → 外观」的字体是 JS 写入 `body` 的内联样式，优先级高于样式表，不带 `!important` 会完全无效且**不报错**。

## 验证

`Ctrl + Shift + I`（不是 F12）打开 Console：

```js
document.documentElement.getAttribute('data-claude-fonts')  // "on"
```

## 许可

MIT。字体归 Anthropic 所有，不在本许可范围内。
