<template>
  <div
    class="hover: relative select-none p-3 px-0 pb-5 text-[var(--vscode-foreground)]"
  >
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="mr-2 h-12 w-12 shrink-0">
        <Placeholder v-if="!module.icon" />
        <img
          v-else
          :src="`https://api.nuxtjs.org/api/ipx/s_80,f_webp/gh/nuxt/modules/main/icons/${module.icon}`"
          :alt="module.name"
          loading="lazy"
        />
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h3 class="text-base font-bold" v-text="module.name" />
            <div v-if="module.type == 'official'" class="ml-2">
              <IconNuxt />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <IconStar class="h-4 w-4" />
              <span class="text-xs font-normal">
                {{ formatNumber(module.stars) }}
              </span>
            </div>
            <div class="flex gap-1">
              <IconDownloads class="h-4 w-4" />
              <span class="text-xs font-normal">
                {{ formatNumber(module.downloads) }}
              </span>
            </div>
          </div>
        </div>
        <p
          class="mt-1 line-clamp-1 max-w-[95%] overflow-hidden text-ellipsis text-xs"
          v-text="module.description"
        />
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <button
            class="rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] px-3 py-1 text-xs font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            @click.prevent="installModule"
            v-text="installed ? 'Installed' : buttonText"
            :disabled="disabled || installed"
          />

          <a :href="module.github" class="text-xs text-[#00DC82]"> Docs</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { vscode } from "./../utilities/vscode";

import Placeholder from "./Icons/Placeholder.vue";
import IconNuxt from "./Icons/Nuxt.vue";
import IconStar from "./Icons/Star.vue";
import IconDownloads from "./Icons/Downloads.vue";
import { ref } from "vue";

const props = defineProps<{
  module: any;
  installed?: boolean;
}>();

const moduleIconURL = `https://raw.githubusercontent.com/nuxt/modules/main/icons/${props.module.icon}`;

const disabled = ref(false);
const buttonText = ref("Install");

const formatNumber = (number: number) => {
  if (number >= 1000) {
    return (number / 1000).toFixed(0) + "k";
  } else {
    return number.toString();
  }
};
const installModule = () => {
  vscode.postMessage({
    command: "installModule",
    module: props.module,
  });
  disabled.value = true;
  buttonText.value = "Installing";
};
window.addEventListener("message", (event: any) => {
  const message = event.data;
  switch (message.command) {
    case "moduleInstalled":
      if (message.cmd !== props.module.npm) {
        break;
      }
      if (message.installed == true) {
        buttonText.value = "Installed";
      } else {
        buttonText.value = "Install";
        disabled.value = false;
      }
      break;
  }
});
</script>
