import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import { ServerStyleSheet } from "styled-components";

const MyDocument = (props) => {
  // 从 props 中获取语言信息，如果没有则默认为 zh-CN
  const locale = props.locale || "zh-CN";

  return (
    <Html lang={locale}>
      <title>NSGM CLI</title>
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui"
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta charSet="utf-8" />
      <Head>
        {/* 直接使用现有的 FontAwesome CSS 文件 */}
        <link rel="stylesheet" href="/fonts/font-awesome.min.css" />

        {/* 预加载字体文件以改善性能 */}
        <link
          rel="preload"
          href="/fonts/fontawesome-webfont.woff2?v=4.7.0"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fontawesome-webfont.woff?v=4.7.0"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />

        {/* 预加载 Ant Design 图标字体 */}
        <style>{`
          @font-face {
            font-family: 'anticon';
            src: url('https://at.alicdn.com/t/c/font_2606242_38n78a9x7xg.woff2?t=1730304019440') format('woff2'),
                 url('https://at.alicdn.com/t/c/font_2606242_38n78a9x7xg.woff?t=1730304019440') format('woff');
            font-display: swap;
          }
        `}</style>

        {/* 确保字体正确显示的额外样式 */}
        <style>{`
          .fa {
            font-family: FontAwesome !important;
            font-style: normal !important;
            font-weight: normal !important;
            text-decoration: inherit;
            line-height: 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* 防止页面刷新时的布局抖动 */
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          /* 防止图标加载时的抖动 */
          .anticon {
            display: inline-block;
            font-style: normal;
            line-height: 0;
            text-align: center;
            text-transform: none;
            vertical-align: -0.125em;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* 基础布局样式 - 立即应用 */
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }

          /* 确保 Header 布局稳定 */
          .ant-layout-header {
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            transition: none !important;
            min-height: 100px;
            box-sizing: border-box;
          }

          /* 防止所有 Ant Design 组件的动画和过渡 */
          .ant-badge-count {
            transition: none !important;
          }

          .ant-menu {
            transition: none !important;
          }

          .ant-menu-item {
            transition: none !important;
          }

          .ant-menu-horizontal {
            border-bottom: none !important;
          }

          .ant-btn {
            transition: none !important;
          }

          .ant-carousel {
            transition: none !important;
          }

          .ant-carousel .slick-list {
            transition: none !important;
          }

          .ant-carousel .slick-track {
            transition: none !important;
          }

          /* 确保搜索框稳定 */
          .ant-input-search {
            transition: none !important;
          }

          /* 确保 Badge 稳定 */
          .ant-badge {
            transition: none !important;
          }

          /* 防止图片加载时的抖动 */
          img {
            display: block;
            max-width: 100%;
            height: auto;
          }

          /* 确保所有元素有 box-sizing */
          * {
            box-sizing: border-box;
          }

          /* 防止文字闪动 */
          .ant-btn-text {
            transition: none !important;
          }

          /* 强制 Header 固定高度，防止内容变化导致抖动 */
          .ant-layout-header {
            height: auto !important;
            min-height: 120px !important;
            max-height: 120px !important;
            overflow: hidden !important;
          }

          /* 固定徽标大小，防止数字变化时抖动 */
          .ant-badge-count {
            min-width: 16px !important;
            height: 16px !important;
            line-height: 16px !important;
            padding: 0 4px !important;
            font-size: 10px !important;
          }

          /* 确保 Menu 高度固定 */
          .ant-menu-horizontal {
            height: 46px !important;
            line-height: 46px !important;
          }

          /* 防止按钮文字换行导致高度变化 */
          .ant-btn {
            white-space: nowrap !important;
          }

          /* 确保搜索框高度固定 */
          .ant-input-search .ant-input {
            height: 40px !important;
          }

          /* 防止布局计算导致的抖动 */
          .ant-space {
            flex-wrap: nowrap !important;
          }
        `}</style>

        {/* 抑制服务端渲染的 useLayoutEffect 警告 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window === 'undefined') {
                global.window = {};
              }
              
              // 在服务端抑制 useLayoutEffect 警告
              if (typeof console !== 'undefined' && typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && message.includes('useLayoutEffect does nothing on the server')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && message.includes('useLayoutEffect does nothing on the server')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

// MyDocument.renderDocument = Document.renderDocument

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const sheet = new ServerStyleSheet();
  const originalRenderPage = ctx.renderPage;

  try {
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
      });

    const initialProps = await Document?.getInitialProps(ctx);

    return {
      ...initialProps,
      locale: ctx.locale || "zh-CN",
      styles: [initialProps.styles, sheet.getStyleElement()],
    };
  } finally {
    sheet.seal();
  }
};

export default MyDocument;
