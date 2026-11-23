window.__ModuleLoader__.load({
  id: "dsh-claude-fonts",
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;

    /* ── 字体栈 ──────────────────────────────────────────────────────
     * 拉丁部分用 Anthropic 三款字体（已随系统安装），
     * 中文按 DSH 默认回退顺序接思源字体。 */

    var SANS =
      '"Anthropic Sans Web Text", "Anthropic Sans", "Noto Sans SC", ' +
      '"Source Han Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", ' +
      '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", ' +
      '"Helvetica Neue", Helvetica, Arial, sans-serif';

    var SERIF =
      '"Anthropic Serif Web Text", "Anthropic Serif", "Noto Serif SC", ' +
      '"Source Han Serif SC", Georgia, "Times New Roman", serif';

    var MONO =
      '"Anthropic Mono Variable", "Anthropic Mono", "SF Mono", "JetBrains Mono", ' +
      '"Fira Code", Consolas, "Liberation Mono", Menlo, Courier, ' +
      '"Noto Sans SC", "Microsoft YaHei", monospace';

    /* ── 为什么需要 !important ──────────────────────────────────────
     * DSH 0.2.2 的 ui-theme 在 :root 和 body 上都定义字体变量：
     *   :root{ --dsw-font-family: var(--dsh-font-family-text-default); }
     *   body{ --dsw-font-family: var(--dsh-font-family-text, ...); }
     * 而「设置 → 外观」的正文字体 / 代码字体是通过 JS 写到 body 的
     * 内联样式上的，内联样式优先级高于任何 <style> 表。
     * 所以样式表里的声明必须带 !important，否则会被静默覆盖。 */

    var VARS = {
      "--dsh-font-family-text": SANS,
      "--dsh-font-family-code": MONO,
      "--dsw-font-serif": SERIF,
      "--dsw-font-family": SANS,
      "--ds-font-family-code": MONO
    };

    var css = "";

    /* :root 与 body 两处都写，均带 !important */
    for (var selector of [":root", "body"]) {
      css += selector + "{\n";
      for (var k in VARS) css += "  " + k + ": " + VARS[k] + " !important;\n";
      css += "}\n";
    }

    /* Markdown 正文与标题走 font 简写（font: var(--dsw-font-markdown-h1)），
     * 字体族已烧进简写值里，必须按分量重建简写、只替换字体族。
     * 字号 / 行高沿用 DSH 自己的 token，所以设置里调字号仍然有效。 */
    var DELTA = "var(--dsh-content-font-delta)";
    var SIZE = "var(--dsh-content-font-size,14px)";

    /* [variant, style, weight, size, line-height] */
    var VARIANTS = [
      ["h1", "normal", "700", "calc(21px + " + DELTA + ")", "calc(30px + " + DELTA + ")"],
      ["h2", "normal", "700", "calc(19px + " + DELTA + ")", "calc(28px + " + DELTA + ")"],
      ["h3", "normal", "700", "calc(18px + " + DELTA + ")", "calc(26px + " + DELTA + ")"],
      ["h4", "normal", "600", SIZE, "calc(24px + " + DELTA + ")"],
      ["base", "normal", "400", SIZE, "calc(24px + " + DELTA + ")"],
      ["base-strong", "normal", "600", SIZE, "calc(24px + " + DELTA + ")"],
      ["base-italic", "italic", "400", SIZE, "calc(24px + " + DELTA + ")"],
      ["base-strong-italic", "italic", "600", SIZE, "calc(24px + " + DELTA + ")"],
      ["table", "normal", "400", "13px", "22px"],
      ["table-head", "normal", "500", "13px", "22px"],
      ["small", "normal", "400", "12px", "20px"],
      ["small-strong", "normal", "600", "12px", "20px"],
      ["small-italic", "italic", "400", "12px", "20px"],
      ["small-strong-italic", "italic", "600", "12px", "20px"]
    ];

    function part(variant, field, fallback) {
      return "var(--dsw-font-markdown-" + variant + "-" + field + "," + fallback + ")";
    }

    css += "body{\n";
    for (var i = 0; i < VARIANTS.length; i++) {
      var v = VARIANTS[i];
      css += "  --dsw-font-markdown-" + v[0] + ": " +
        part(v[0], "font-style", v[1]) + " " +
        part(v[0], "font-weight", v[2]) + " " +
        part(v[0], "font-size", v[3]) + "/" +
        part(v[0], "line-height", v[4]) + " " +
        "var(--dsw-font-serif) !important;\n";
    }
    css += "}\n";

    function apply(ctx) {
      if (typeof document === "undefined") return;

      var tagId = "dsh-claude-fonts/fonts.css";

      /* 1) 注入样式表（带 !important） */
      if (document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
        var tag = document.createElement("style");
        tag.dataset.plugin = "dsh-claude-fonts";
        tag.dataset.pluginCss = tagId;
        tag.textContent = css;
        document.head.appendChild(tag);
      }

      /* 2) 直接写内联样式，priority=important。
       * 这一层是为了压过「设置 → 外观」写入的内联变量：
       * 内联 + important 是 CSS 级联里最高的一档。 */
      var target = document.body;
      if (target) {
        for (var name in VARS) {
          try {
            target.style.setProperty(name, VARS[name], "important");
          } catch (e) {
            /* 忽略个别浏览器差异，样式表那层仍然生效 */
          }
        }
      }

      /* 3) 可见标记：插件跑起来后 <html> 上会有 data-claude-fonts="on" */
      document.documentElement.setAttribute("data-claude-fonts", "on");

      /* 4) DSH 是 SPA，body 可能被替换；观察一次以重新施加内联变量 */
      var observer = null;
      if (typeof MutationObserver === "function") {
        observer = new MutationObserver(function () {
          var b = document.body;
          if (b) {
            for (var n in VARS) {
              try {
                b.style.setProperty(n, VARS[n], "important");
              } catch (e) {}
            }
          }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      }

      ctx.effect(function () {
        return function () {
          var t = document.querySelector('style[data-plugin-css="' + tagId + '"]');
          if (t) t.remove();
          if (observer) observer.disconnect();
          document.documentElement.removeAttribute("data-claude-fonts");
          if (document.body) {
            for (var n in VARS) {
              try {
                document.body.style.removeProperty(n);
              } catch (e) {}
            }
          }
        };
      });
    }

    exports.apply = apply;
    exports.inject = [];
    return module.exports;
  }
});
