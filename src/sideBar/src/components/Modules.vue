<!-- Filter and display Nuxt modules and layers for installation. -->
<template>
  <div
    class="sticky top-0 z-10 flex select-none flex-col gap-2 bg-[var(--vscode-sideBar-background)] pb-3"
  >
    <input
      v-model="searchResult"
      ref="searchInput"
      placeholder="Search Integrations..."
      class="my-3 w-full rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-dropdown-background)] p-2.5 text-[var(--vscode-foreground)]"
    />
    <ModulesFilter
      :modulesCount="filteredModules.length"
      :nuxtVersions="nuxtVersions"
      :categories="categories"
      :types="types"
      :open="showFilter"
      :selectedIntegrationType="selectedIntegrationType"
      @selectCategory="selectedCategory = $event"
      @selectVersion="selectedVersion = $event"
      @selectType="selectedType = $event"
      @selectIntegrationType="selectedIntegrationType = $event"
    />
  </div>
  <div class="mt-2 flex items-center justify-between gap-2 text-xs">
    <span role="status">{{ catalogueStatus }}</span>
    <button :disabled="refreshing" @click="refreshCatalogue" class="text-[var(--vscode-textLink-foreground)]">{{ refreshing ? 'Refreshing…' : 'Refresh catalogue' }}</button>
  </div>
  <div class="mt-5 w-full">
    <ModuleCard
      v-for="module in filteredModules"
      :key="module.npm"
      :module="module"
      :installed="isModuleInstalled(module.npm)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { vscode } from "../utilities/vscode";
onMounted(() => vscode.postMessage({ command: "ready" }));
import { useHostMessages } from "../composables/events";
import semver from "semver";
import { moduleCompatible } from "../../../core/catalogue";
import { useModules, Module } from "../composables/modules";
import ModuleCard from "./ModuleCard.vue";
import ModulesFilter from "./ModulesFilter.vue";
import { ref, computed } from "vue";

const searchInput = ref<HTMLElement | null>(null);

const modules = ref<Module[]>(useModules());
const projectVersion = ref<string>();
const catalogueStatus = ref("Bundled offline snapshot");
const refreshing = ref(false);
/** Request a bounded host refresh while retaining the current catalogue on screen. */
function refreshCatalogue () { refreshing.value = true; vscode.postMessage({ command: "refreshCatalogue" }); }
/** Evaluate a selected major or the exact project version using semver ranges. */
function compatible (module: Module): boolean {
  if (selectedVersion.value === "All") return true;
  if (selectedVersion.value === "Project") return moduleCompatible(module, projectVersion.value);
  const major = Number(selectedVersion.value[0]);
  return Boolean(module.compatibility.nuxt && semver.intersects(module.compatibility.nuxt, `>=${major}.0.0 <${major + 1}.0.0`));
}

const nuxtVersions = ref(["Project", "4.x", "3.x", "2.x", "All"]);

const selectedVersion = ref("Project");
const selectedIntegrationType = ref("All");
const selectedCategory = ref("All");
const selectedType = ref("All");
const searchResult = ref("");
const installedModules = ref([]);
const showFilter = ref(false);

const types = computed(() => ["All", ...new Set(modules.value.map(module => module.type.charAt(0).toUpperCase() + module.type.slice(1)))].sort());
// unique categories from modules with tag 3.x
const categories = computed(() => {
  const categories = modules.value
    .filter((m: Module) => compatible(m))
    .map((m: Module) => m.category)
    .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
    .sort();
  categories.unshift("All");
  return categories;
});

const filteredModules = computed(() => {
  // filter by selected version
  const filteredByVersion = modules.value.filter((m: Module) =>
    compatible(m),
  );

  // filter by selected category
  const filteredByCategory = filteredByVersion.filter(
    ({ category }: any) =>
      selectedCategory.value === "All" || category === selectedCategory.value,
  );

  // filter by selected type
  const filteredByType = filteredByCategory.filter(
    ({ type }: any) =>
      selectedType.value === "All" || type === selectedType.value.toLowerCase(),
  );

  // sort by high downloads
  const sortedByDownloads = filteredByType.sort(
    (a: any, b: any) => (b.stats.downloads || 0) - (a.stats.downloads || 0),
  );

  // filter by search result
  const filteredBySearch = sortedByDownloads.filter((m: Module) =>
    (m.name + " " + m.description)
      .toLowerCase()
      .includes(searchResult.value.toLowerCase()),
  );

  // filter by selectedIntegrationType
  if (selectedIntegrationType.value === "Layers") {
    const filteredByExtends = filteredBySearch.filter((m: Module) =>
      m.isLayer ? true : false,
    );
    return filteredByExtends;
  } else if (selectedIntegrationType.value === "Modules") {
    const filteredByExtends = filteredBySearch.filter((m: Module) =>
      m.isLayer ? false : true,
    );
    return filteredByExtends;
  }

  return filteredBySearch;
});

/** Check the current dependency list using the canonical package name. */
const isModuleInstalled = (module: string) => {
  if (installedModules.value?.find((m: Module) => m.name === module)) {
    return true;
  }
  return false;
};

useHostMessages( (event: any) => {
  const message = event.data;
  switch (message.command) {
    case "moduleCatalogue":
      modules.value = message.data.modules;
      projectVersion.value = message.data.projectVersion;
      catalogueStatus.value = message.data.error ? "Offline; showing saved catalogue" : `${message.data.source === 'network' ? 'Updated catalogue' : message.data.source === 'cache' ? 'Cached catalogue' : 'Bundled offline snapshot'} (${new Date(message.data.updatedAt).toLocaleDateString()})`;
      refreshing.value = false;
      break;
    case "installedModules":
      installedModules.value = message.data;
      break;
    case "addLayer":
      selectedIntegrationType.value = "Layers";
      break;
    case "addModule":
      selectedIntegrationType.value = "Modules";
      break;
  }
});
</script>
