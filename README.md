# dsh-claude-fonts

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 换上 Claude 的字体。

| 部位 | 字体 |
| --- | --- |
| 界面（侧栏、按钮、设置） | `Anthropic Sans Web Text` |
| 对话正文与标题 | `Anthropic Serif Web Text` |
| 代码 | `Anthropic Mono Variable` |

中文回退到 Noto / 思源，再没有就用系统字体。

## 自带字体

三款字体已用 base64 内联在 `lib/client.js` 里，**装上插件就能用，不需要在系统里另外装字体**。

`fonts/` 目录里的 `.ttf` 是同一批文件的原始副本，方便你自己安装到系统（在别的软件里也能用）。

> DSH 的插件资源路由只支持 svg/png/webp/jpg，不提供字体格式，所以字体只能以 `data:` URI 嵌进样式表。

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
document.fonts.check('16px "Anthropic Sans Web Text"')      // true
```

## 许可

代码 MIT。

字体是 Anthropic 的专有字体，权利归 Anthropic 所有，不在 MIT 范围内。仓库内的字体文件仅为本插件使用，请勿再分发。
