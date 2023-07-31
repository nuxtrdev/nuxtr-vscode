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
  <div class="mt-5 w-full">
    <ModuleCard
      v-for="(module, index) in filteredModules.slice(0, 100)"
      :key="index"
      :module="module"
      :installed="isModuleInstalled(module.npm)"
    />
  </div>
</template>

<script setup lang="ts">
import { useModules } from "./../composables/modules";
import ModuleCard from "./ModuleCard.vue";
import ModulesFilter from "./ModulesFilter.vue";
import { ref, computed } from "vue";

const searchInput = ref<HTMLElement | null>(null);

const modules = useModules();

const nuxtVersions = ref(["3.x", "2.x", "2.x-bridge"]);

const selectedVersion = ref("3.x");
const selectedIntegrationType = ref("All");
const selectedCategory = ref("All");
const selectedType = ref("All");
const searchResult = ref("");
const installedModules = ref([]);
const showFilter = ref(false);

const types = ref(
  modules
    .map((m: any) => {
      return m.type.charAt(0).toUpperCase() + m.type.slice(1);
    })
    .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
    .sort(),
);
types.value.unshift("All");
// unique categories from modules with tag 3.x
const categories = computed(() => {
  const categories = modules
    .filter((m: any) => m.tags.includes(selectedVersion.value))
    .map((m: any) => m.category)
    .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
    .sort();
  categories.unshift("All");
  return categories;
});

const filteredModules = computed(() => {
  // filter by selected version
  const filteredByVersion = modules.filter((m: any) =>
    m.tags.includes(selectedVersion.value),
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
    (a: any, b: any) => b.downloads - a.downloads,
  );

  // filter by search result
  const filteredBySearch = sortedByDownloads.filter((m: any) =>
    (m.name + " " + m.description)
      .toLowerCase()
      .includes(searchResult.value.toLowerCase()),
  );

  // filter by selectedIntegrationType
  if (selectedIntegrationType.value === "Layers") {
    const filteredByExtends = filteredBySearch.filter((m: any) =>
      m.isLayer ? true : false,
    );
    return filteredByExtends;
  } else if (selectedIntegrationType.value === "Modules") {
    const filteredByExtends = filteredBySearch.filter((m: any) =>
      m.isLayer ? false : true,
    );
    return filteredByExtends;
  }

  return filteredBySearch;
});

const isModuleInstalled = (module: string) => {
  if (installedModules.value?.find((m: any) => m.name === module)) {
    return true;
  }
  return false;
};

window.addEventListener("message", (event: any) => {
  const message = event.data;
  switch (message.command) {
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
