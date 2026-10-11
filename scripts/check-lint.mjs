/** Guard sidebar lint coverage with a valid TypeScript SFC and an invalid Vue template. */
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';

const eslint = new ESLint();
const filePath = 'src/sideBar/src/components/Modules.vue';
const [valid] = await eslint.lintText(
    '<script setup lang="ts">const label: string = "test";</script><template><div>{{ label }}</div></template>',
    { filePath }
);
assert.equal(valid.errorCount, 0, JSON.stringify(valid.messages));
const [invalid] = await eslint.lintText('<template><div v-else /></template>', { filePath });
assert.ok(invalid.messages.some(message => message.ruleId === 'vue/valid-v-else'),
    'Vue template rules must run on sidebar files');
console.log('PASS: Vue template lint and TypeScript SFC parsing');
