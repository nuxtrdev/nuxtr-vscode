/** Render the sidebar shell with explicit local assets and a restrictive, correctly separated CSP. */
export interface SidebarAssets { css: string; js: string; source: string; nonce: string; }

/** Produce a webview document that allows its own scripts/styles and public module icons only. */
export function sidebarHtml ({ css, js, source, nonce }: SidebarAssets): string {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${source} https: data:; style-src ${source} 'unsafe-inline'; font-src ${source}; script-src 'nonce-${nonce}'; connect-src 'none';">
<link rel="stylesheet" href="${css}"><title>Nuxtr</title></head>
<body><div id="app"></div><script type="module" nonce="${nonce}" src="${js}"></script></body></html>`;
}
