<template>
  <div>
    <button
      class="relative flex w-full items-center gap-1.5"
      @click="listOpen = !listOpen"
    >
      <IconFilter />
      <span>Filters ({{ modulesCount }} modules found)</span>
      <span
        class="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center"
      >
        <svg
          class="h-3 w-3 -rotate-90 transition-all duration-300"
          :class="{ 'rotate-0': listOpen }"
          viewBox="0 0 11 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L5.5 5.5L10 1"
            stroke="currentColor"
            stroke-width="1.38"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
    <Transition name="slide-fade">
      <div v-show="listOpen" class="mt-3 flex flex-col gap-3">
        <DropdownItem
          :label="integrationType"
          :items="integrationTypes"
          :selecteditemValue="integrationType"
          @selectedItem="selectIntegrationType($event)"
        />
        <DropdownItem
          :label="selectedVersion"
          :items="nuxtVersions"
          :selecteditemValue="selectedVersion"
          @selectedItem="selectVersion($event)"
        />
        <DropdownItem
          :label="selectedType"
          :items="types"
          :selecteditemValue="selectedType"
          @selectedItem="selectType($event)"
        />
        <DropdownItem
          :label="selectedCategory"
          :items="categories"
          :selecteditemValue="selectedCategory"
          @selectedItem="selectCategory($event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import IconFilter from "./Icons/Filter.vue";
import DropdownItem from "./DropdownItem.vue";
const props = defineProps({
  modulesCount: {
    type: Number,
    default: 0,
  },
  nuxtVersions: {
    type: Array,
    default: () => ["3.0.0", "2.0.0"],
  },
  categories: {
    type: Array,
    required: true,
  },
  types: {
    type: Array,
    required: true,
  },
  integrationTypes: {
    type: Array,
    default: () => ["All", "Modules", "Layers"],
  },
  open: {
    type: Boolean,
    default: false,
  },
  selectedIntegrationType: {
    type: String,
    default: "All Integrations",
  },
});

const emit = defineEmits([
  "selectCategory",
  "selectVersion",
  "selectType",
  "selectIntegrationType",
]);

const listOpen = ref(props.open || false);
const integrationType = ref("All Integrations");
const selectedVersion = ref("3.0.0");
const selectedType = ref("Type");
const selectedCategory = ref("Category");

const selectCategory = (event: any) => {
  selectedCategory.value = event;
  emit("selectCategory", event);
};
const selectVersion = (event: any) => {
  selectedVersion.value = event;
  emit("selectVersion", event);
};

const selectIntegrationType = (event: any) => {
  integrationType.value = event;
  emit("selectIntegrationType", event);
};

const selectType = (event: any) => {
  selectedType.value = event;
  emit("selectType", event);
};

// watch for open prop changes
watch(
  () => props.open,
  (value) => {
    listOpen.value = value;
  },
);

watch(
  () => props.selectedIntegrationType,
  (value) => {
    selectIntegrationType(value);
  },
);
</script>
