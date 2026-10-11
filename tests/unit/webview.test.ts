/** Validate the packaged webview policy and exact asset references before browser execution. */
import { expect, it } from 'vitest';
import { sidebarHtml } from '../../src/core/webview';
it('separates restrictive CSP directives and grants only nonce-bearing scripts', () => {
    const html = sidebarHtml({ css: 'https://local/index.css', js: 'https://local/index.js', source: 'https://local', nonce: 'safeNonce' });
    expect(html).toContain('default-src \'none\'; img-src https://local https: data:;');
    expect(html).toContain('script-src \'nonce-safeNonce\'; connect-src \'none\';');
    expect(html).toContain('nonce="safeNonce" src="https://local/index.js"');
    expect(html).not.toContain('unsafe-eval');
});
