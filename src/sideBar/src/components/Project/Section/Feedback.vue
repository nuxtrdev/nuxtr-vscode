<!-- Link project feedback to the public issue tracker and community discussions. -->
<template>
  <section class="my-3 flex flex-col gap-2 px-3 text-sm text-[var(--vscode-foreground)]" aria-label="Feedback">
    <p class="font-medium">Feedback</p>
    <button class="text-left text-[var(--vscode-textLink-foreground)]" @click="openFeedback('issues')">Report an issue</button>
    <button class="text-left text-[var(--vscode-textLink-foreground)]" @click="openFeedback('discussions')">Share an idea</button>
  </section>
</template>
<script setup lang="ts">
import { vscode } from '../../../utilities/vscode';
/** Open the requested community page through the validated extension-host link action. */
function openFeedback (page: 'issues' | 'discussions') {
  vscode.postMessage({ command: 'openExternal', url: 'https://github.com/nuxtrdev/nuxtr-vscode/' + page });
}
</script>
