/** Reproduce Vue proxy transport failures at the actual sidebar-to-VS Code message boundary. */
import { expect, it, vi } from 'vitest';

it('sends a cloneable canonical install request even when the catalogue card holds a reactive proxy', async () => {
    const received: unknown[] = [];
    vi.stubGlobal('acquireVsCodeApi', () => ({ postMessage: (message: unknown) => received.push(structuredClone(message)) }));
    try {
        const { vscode } = await import('../../src/sideBar/src/utilities/vscode');
        const module = new Proxy({ npm: 'nuxt-aos', runtime: false, name: 'aos', stats: new Proxy({ stars: 1 }, {}) }, {});
        expect(() => vscode.postMessage({ command: 'installModule', module })).not.toThrow();
        expect(received).toEqual([{ command: 'installModule', module: { npm: 'nuxt-aos', runtime: false, dependencyType: undefined, 'dependency-type': undefined } }]);
        expect(() => vscode.postMessage({ command: 'installModule', module: { npm: 'nuxt; echo hacked' } })).toThrow();
        expect(received).toHaveLength(1);
    } finally { vi.unstubAllGlobals(); }
});
