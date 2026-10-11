/** Audit purpose headers and JSDoc on named functions in source files changed by this modernization. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import ts from 'typescript';
const baseline = 'cc48b77b9eb5066a11e1ae4a48a9ef09c9458e23';
const tracked = execFileSync('git', ['diff', '--name-only', baseline], { encoding: 'utf8' }).trim().split('\n');
const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split('\n');
const failures = [];
for (const file of new Set([...tracked, ...untracked])) {
    if (!existsSync(file) || !/^(?:src|scripts)\/.+\.(?:[cm]?[jt]s|vue)$/.test(file)) { continue; }
    const full = readFileSync(file, 'utf8');
    if (!/^\s*(?:\/\*\*|<!--)/.test(full)) { failures.push(file + ': missing file-purpose header'); }
    const content = file.endsWith('.vue') ? /<script[^>]*>([\s\S]*?)<\/script>/.exec(full)?.[1] || '' : full;
    const tree = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, file.endsWith('.vue') ? ts.ScriptKind.TS : undefined);
    /** Find named functions and check attached JSDoc, including arrow functions owned by variable statements. */
    function visit (node) {
        const named = ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node)
            || ts.isVariableDeclaration(node) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));
        if (named) {
            const docs = ts.getJSDocCommentsAndTags(node);
            if (!docs.some(comment => ts.isJSDoc(comment))) {
                const line = tree.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                failures.push(file + ':' + line + ': ' + (node.name?.getText(tree) || 'constructor') + ' needs JSDoc');
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(tree);
}
if (failures.length > 0) { console.error(failures.join('\n')); process.exitCode = 1; }
else { console.log('PASS: purpose headers and named-function JSDoc in modified sources'); }
