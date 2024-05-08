<template>
    <div class="flex select-none flex-col gap-2 font-inter">
        <div class="flex w-full pb-40 relative flex-col items-center">
            <div class="flex overflow-y-auto max-h-fit flex-col w-full">
                <Actions :scripts="projectViewData.scripts" />
                <Dependencies :dependencies="projectViewData.dependencies" :outdated="projectViewData.outdatedDependencies" />
                <Snippets :snippets="projectViewData.snippets" />
                <FileTemplates :templates="projectViewData.fileTemplates" />
                <Feedback class=" bg-[var(--vscode-sideBar-background)]" :content="projectViewData.feedbackContent" />
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import Actions from "./Project/Section/Actions.vue";
import Dependencies from "./Project/Section/Dependencies.vue";
import Snippets from "./Project/Section/Snippets.vue";
import FileTemplates from "./Project/Section/FileTemplates.vue";
import Feedback from "./Project/Section/Feedback.vue";

const fileTemplates = ["default.layout-template", "default.page-template"]

const projectViewData = reactive({
    dependencies: [],
    scripts: {},
    snippets: {},
    feedbackContent: {},
    outdatedDependencies: [],
    fileTemplates: {},
});

window.addEventListener("message", (event: any) => {
    const message = event.data;
    switch (message.command) {
        case "projectViewData":
            projectViewData.scripts = message.data.scripts;
            projectViewData.dependencies = message.data.dependencies;
            projectViewData.snippets = message.data.snippets;
            projectViewData.feedbackContent = message.data.feedbackContent;
            projectViewData.fileTemplates = message.data.fileTemplates;
            break;
        case "outdatedDependencies":
            projectViewData.outdatedDependencies = message.data;
            break;
    }
});
</script>
