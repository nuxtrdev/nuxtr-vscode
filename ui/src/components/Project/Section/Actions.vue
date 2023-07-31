<template>
    <div class="my-0.5 flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
        <div class="flex w-full cursor-pointer flex-row items-center" @click="expandSection">
            <IconChevron class="h-2.5 w-2.5" :listOpen="isSectionOpened" />
            <div class="mx-2.5 flex flex-1 flex-row items-center gap-2 hover:bg-[var(--vscode-list-hoverBackground)]">
                <IconFlash class="h-3 w-3" />
                <p class="text-sm font-medium">Actions</p>
            </div>
        </div>
        <Transition name="slide-down-fade">
            <div @click.stop v-if="isSectionOpened" class="mx-auto mb-2.5 mt-1 w-11/12 px-2"
                :class="{ showing: isSectionOpened, hidden: !isSectionOpened }">
                <a href="#" :title="`Execute script ${script}`"
                    class="flex w-full flex-row items-center !text-[var(--vscode-foreground)] hover:bg-[var(--vscode-list-hoverBackground)]"
                    v-for="(index, script) in scripts" :key="index" @click.prevent="executeCommand(script)">
                    <IconPlay class="h-3 w-3" />
                    <p class="ml-2 text-sm">{{ script }}</p>
                </a>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import IconChevron from "../../Icons/Chevron.vue";
import IconFlash from "../../Icons/Flash.vue";
import IconPlay from "../../Icons/Play.vue";
import { vscode } from "../../../utilities/vscode";

defineProps({
    scripts: {
        type: Object,
        required: true,
    },
});

const isSectionOpened = ref(true);

const expandSection = () => {
    isSectionOpened.value = !isSectionOpened.value;
};

const executeCommand = (script: string) => {
    vscode.postMessage({
        command: "runAction",
        script,
    });
};
</script>

<style>
.fadeHeight-enter-active,
.fadeHeight-leave-active {
    transition: all 0.2s;
    max-height: 230px;
}

.fadeHeight-enter,
.fadeHeight-leave-to {
    opacity: 0;
    max-height: 0px;
}
</style>
