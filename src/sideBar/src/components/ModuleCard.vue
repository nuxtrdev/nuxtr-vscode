<!-- Display module metadata, dispatch installation and show progress or recoverable failures. -->
<template>
  <div role="article" :aria-label="`Module ${module.npm}`"
    class="hover: relative select-none p-3 px-0 pb-5 text-[var(--vscode-foreground)]"
  >
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="mr-2 h-12 w-12 shrink-0">
        <Placeholder v-if="!module.icon || iconFailed" />
        <img
          v-else
          :src="`https://raw.githubusercontent.com/nuxt/modules/main/icons/${module.icon}`"
          :alt="module.name"
          loading="lazy"
          @error="iconFailed = true"
        />
      </div>
      <div class="flex-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <h3 class="text-base font-bold" v-text="module.name" />
            <div v-if="module.type === 'official'" class="ml-2">
              <IconNuxt />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1" v-if="module.stats.stars !== undefined">
              <IconStar class="h-4 w-4" />
              <span class="text-xs font-normal">
                {{ formatNumber(module.stats.stars) }}
              </span>
            </div>
            <div class="flex gap-1" v-if="module.stats.downloads !== undefined">
              <IconDownloads class="h-4 w-4" />
              <span class="text-xs font-normal">
                {{ formatNumber(module.stats.downloads) }}
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

          <button @click="openDocumentation" class="text-xs text-[var(--vscode-textLink-foreground)]">Docs</button>
        </div>
        <p v-if="installationError" role="alert" class="mt-2 text-xs text-[var(--vscode-errorForeground)]">{{ installationError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHostMessages } from "../composables/events";
import { vscode } from "../utilities/vscode";

import Placeholder from "./Icons/Placeholder.vue";
import IconNuxt from "./Icons/Nuxt.vue";
import IconStar from "./Icons/Star.vue";
import IconDownloads from "./Icons/Downloads.vue";
import { ref } from "vue";

import { Module } from "../composables/modules";

const props = defineProps<{
  module: Module;
  installed?: boolean;
}>();


const disabled = ref(false);
const iconFailed = ref(false);
const buttonText = ref("Install");
const installationError = ref("");

/** Format catalogue counts for the compact module card. */
const formatNumber = (number: number | undefined) => {
  if (number === undefined) return "—";
  if (number >= 1000) {
    return (number / 1000).toFixed(0) + "k";
  } else {
    return number.toString();
  }
};
/** Request installation and show pending status until the host reports its result. */
const installModule = () => {
  disabled.value = true;
  buttonText.value = "Installing";
  installationError.value = "";
  try {
    vscode.postMessage({ command: "installModule", module: props.module });
  } catch (error) {
    disabled.value = false;
    buttonText.value = "Install";
    installationError.value = `Could not request installation: ${String(error)}`;
  }
};
/** Open the validated documentation URL through the extension host. */
function openDocumentation () { vscode.postMessage({ command: "openExternal", url: props.module.website || props.module.github }); }
useHostMessages( (event: any) => {
  const message = event.data;
  switch (message.command) {
    case "moduleInstalled":
      if (message.cmd !== props.module.npm) {
        break;
      }
      if (message.installed === true) {
        buttonText.value = "Installed";
        installationError.value = message.configured === false ? `Installed, but configuration failed: ${message.error || 'Add the module to nuxt.config manually.'}` : "";
      } else {
        buttonText.value = "Install";
        disabled.value = false;
        installationError.value = message.error || "Installation did not complete. Please retry.";
      }
      break;
  }
});
</script>
