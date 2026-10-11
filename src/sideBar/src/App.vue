<!-- Apply shared sidebar spacing and route extension-host navigation events to its pages. -->
<template>
  <main class="sidebar-content">
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import { useHostMessages } from "./composables/events";
import { onMounted } from "vue";
import { vscode } from "./utilities/vscode";
import { useRouter } from "vue-router";

const router = useRouter();
onMounted(() => vscode.postMessage({ command: "ready" }));

useHostMessages( (event: any) => {
  const message = event.data;
  switch (message.command) {
    case "modules":
      router.push("/");
      break;
    case "projectView":
      router.push("/project");
      break;
  }
});
</script>

<style scoped>
/* Keep both sidebar pages inset without relying on the host's default body padding. */
.sidebar-content {
  min-width: 0;
  padding: 12px;
}
</style>
