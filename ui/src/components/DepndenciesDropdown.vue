<template>
  <div class="relative" ref="root">
    <button @click.prevent="toggleMenu()">
      <IconDots class="h-3 w-3" />
      <div
        v-if="isOpened"
        @click.stop
        class="absolute right-0 z-20 flex max-h-[230px] flex-col overflow-y-auto rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] p-1"
      >
        <button
          class="relative rounded-[4px] px-2 py-1.5 pr-8 text-left text-xs font-medium hover:bg-[var(--vscode-list-activeSelectionBackground)]"
          @click.prevent="upgradeModule()"
        >
          <span>Upgrade</span>
        </button>
        <button
          class="relative rounded-[4px] px-2 py-1.5 pr-8 text-left text-xs font-medium hover:bg-[var(--vscode-list-activeSelectionBackground)]"
          @click.prevent="removeModule()"
        >
          <span>Remove</span>
        </button>
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import IconDots from "./Icons/Dots.vue";
import { vscode } from "../utilities/vscode";

const props = defineProps({
  module: {
    type: String,
    required: true,
  },
});
const root = ref(null);
const isOpened = ref(false);

const toggleMenu = () => {
  isOpened.value = !isOpened.value;
};

const upgradeModule = () => {
  vscode.postMessage({
    command: "upgradeModule",
    module: props.module,
  });
  isOpened.value = false;
};

const removeModule = () => {
  vscode.postMessage({
    command: "removeModule",
    module: props.module,
  });
  isOpened.value = false;
};

onMounted(() => {
  document.addEventListener("click", (e) => {
    // @ts-ignore
    if (root.value?.contains(e.target)) return;
    isOpened.value = false;
  });
});
</script>
