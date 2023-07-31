<template>
    <div class="my-0.5 flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
        <div class="flex w-full cursor-pointer flex-row items-center" @click="expandSection">
            <IconChevron class="h-2.5 w-2.5" :listOpen="isSectionOpened" />
            <div class="mx-2.5 flex flex-1 flex-row items-center gap-2 hover:bg-[var(--vscode-list-hoverBackground)]">
                <IconSnippetItem class="h-4 w-4" />
                <p class="text-sm font-medium">Snippets</p>
            </div>
        </div>
        <Transition name="slide-down-fade">
            <div v-if="isSectionOpened" class="mx-auto mb-2.5 mt-1 w-11/12 px-2" :class="{ showing: isSectionOpened, hidden: !isSectionOpened }">
                <div v-for="(snippet, index) in snippets" :key="index"
                    class="group relative flex w-full items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)]">
                    <div class="flex cursor-pointer flex-row items-center">
                        <IconSnippets class="h-3 w-3" />
                        <p class="ml-2 text-sm">
                            {{ snippet.replace(".code-snippets", "") }}
                        </p>
                    </div>

                    <div class="flex flex-row space-x-2">
                        <div @click.prevent="deleteSnippet(snippet)" class="hidden cursor-pointer group-hover:block group-hover:font-medium">
                            <IconTrash class="h-4 w-4" />
                        </div>

                        <div @click.prevent="editSnippet(snippet)" class="hidden cursor-pointer group-hover:block group-hover:font-medium">
                            <IconEdit class="h-4 w-4" />
                        </div>


                    </div>

                </div>
                <div @click.prevent="configureNewSnippet"
                    class="group relative flex w-full items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)]">
                    <div class="flex cursor-pointer flex-row items-center">
                        <IconAdd class="h-3 w-3" />
                        <p class="ml-2 text-sm">Add new snippet</p>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import IconChevron from "../../Icons/Chevron.vue";
import IconSnippets from "../../Icons/Snippets.vue";
import IconAdd from "../../Icons/Add.vue";
import IconEdit from "../../Icons/Edit.vue";
import IconTrash from "../../Icons/Trash.vue";
import IconSnippetItem from "../../Icons/SnippetItem.vue";
import { vscode } from "../../../utilities/vscode";

const isSectionOpened = ref(false);
const expandSection = () => {
    isSectionOpened.value = !isSectionOpened.value;
};

defineProps({
    name: {
        type: String,
    },
    snippets: {
        type: Object,
        required: true,
    },
});

const editSnippet = (snippet: string) => {
    vscode.postMessage({
        command: "editSnippet",
        data: snippet,
    });
};

const deleteSnippet = (snippet: string) => {
    vscode.postMessage({
        command: "deleteSnippet",
        data: snippet,
    });
};

const configureNewSnippet = () => {
    vscode.postMessage({
        command: "configureNewSnippet",
    });
};
</script>
