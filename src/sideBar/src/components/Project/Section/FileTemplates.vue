<!-- Display project filetemplates and dispatch their actions to the extension host. -->
<template>
    <div class="my-0.5 flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
        <button type="button" :aria-expanded="isSectionOpened" class="flex w-full cursor-pointer flex-row items-center" @click="expandSection">
            <IconChevron class="h-2.5 w-2.5" :listOpen="isSectionOpened" />
            <div class="mx-2.5 flex flex-1 flex-row items-center gap-2 hover:bg-[var(--vscode-list-hoverBackground)]">
                <IconTemplates class="h-4 w-4" />
                <p class="text-sm font-medium">File Templates</p>
            </div>
        </button>
        <Transition name="slide-down-fade">
            <div v-if="isSectionOpened" class="mx-auto mb-2.5 mt-1 w-11/12 pl-2" :class="{ showing: isSectionOpened, hidden: !isSectionOpened }">
                <div v-for="(template, index) in templates" :key="index"
                    class="group relative flex w-full items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)]">
                    <div class="flex cursor-pointer flex-row items-center">
                        <IconVue class="h-3 w-3" />
                        <p @click="createFileFromTemplate(template)" class="ml-2 text-sm">
                            {{
                                template
                                    .replace(".page-template", "")
                                    .replace(".layout-template", "")
                            }}
                        </p>

                        <p class="ml-2 px-2 font-medium rounded-sm bg-[var(--vscode-foreground)] text-[var(--vscode-sideBar-background)]  text-xs">
                            {{ template.includes("page") ? "Page" : "Layout" }}
                        </p>
                    </div>

                    <div class="flex flex-row space-x-2">
                        <div @click.prevent="deleteTemplate(template)" class="hidden cursor-pointer group-hover:block group-hover:font-medium">
                            <IconTrash class="h-4 w-4" />
                        </div>

                        <div @click.prevent="editTemplate(template)" class="hidden cursor-pointer group-hover:block group-hover:font-medium">
                            <IconEdit class="h-4 w-4" />
                        </div>
                    </div>
                </div>
                <div @click.prevent="createEmptyFileTemplate"
                    class="group relative flex w-full cursor-pointer items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)]">
                    <div class="flex cursor-pointer flex-row items-center">
                        <IconAdd class="h-3 w-3" />
                        <p class="ml-2 text-sm">Create new Template</p>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import IconChevron from "../../Icons/Chevron.vue";
import IconVue from "../../Icons/Vue.vue";
import IconAdd from "../../Icons/Add.vue";
import IconEdit from "../../Icons/Edit.vue";
import IconTrash from "../../Icons/Trash.vue";
import IconTemplates from "../../Icons/Template.vue";
import { vscode } from "../../../utilities/vscode";

const isSectionOpened = ref(false);
/** Expand or collapse this project section. */
const expandSection = () => {
    isSectionOpened.value = !isSectionOpened.value;
};

defineProps({
    name: {
        type: String,
    },
    templates: {
        type: Object,
        required: true,
    },
});

/** Open the selected project template resource. */
const editTemplate = (template: string) => {
    vscode.postMessage({
        command: "editTemplate",
        data: template,
    });
};

/** Request confirmed deletion of a project template. */
const deleteTemplate = (template: string) => {
    vscode.postMessage({
        command: "deleteTemplate",
        data: template,
    });
};

/** Open the template-kind picker. */
const createEmptyFileTemplate = () => {
    vscode.postMessage({
        command: "createEmptyFileTemplate",
    });
};

/** Request a new file from the selected project template. */
const createFileFromTemplate = (template: string) => {
    vscode.postMessage({
        command: "createFileFromTemplate",
        data: template,
    });
};

</script>
