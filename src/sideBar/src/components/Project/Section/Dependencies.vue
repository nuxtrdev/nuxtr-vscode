<!-- Display declared dependencies, versions and host-managed upgrade/removal actions. -->
<template>
    <div class="my-0.5 flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
        <button type="button" :aria-expanded="isSectionOpened" class="flex w-full cursor-pointer flex-row items-center" @click="expandSection">
            <IconChevron class="h-2.5 w-2.5" :listOpen="isSectionOpened" />
            <div class="mx-2.5 flex flex-1 flex-row items-center gap-2 hover:bg-[var(--vscode-list-hoverBackground)]">
                <IconNPM class="h-4 w-4" />
                <p class="text-sm font-medium">Dependencies</p>
            </div>
        </button>
        <Transition name="slide-down-fade">
            <div v-if="isSectionOpened" class="mx-auto mb-2.5 mt-1 w-11/12 px-2" :class="{ showing: isSectionOpened, hidden: !isSectionOpened }">
                <div v-for="(module, i) in dependencies" :key="i"
                    class="group relative flex w-full items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)]">
                    <div class="flex flex-row items-center overflow-hidden">
                        <div class="flex items-center">
                            <IconModule class="h-3 w-3" />
                            <a :href="`https://npmjs.org/package/${module.name}`" class="mx-2 flex-1 text-sm"
                                :class="{'font-bold': outdated && outdated.length && outdated.find((m: any) => m.name === module.name)}"
                            >{{ module.name
                            }}</a>
                        </div>
                        <p class="flex-1 overflow-hidden text-ellipsis whitespace-pre text-xs">
                            <span class="text-[var(--vscode-descriptionForeground)]">
                                {{ module.version.replace("^", "") }}
                            </span>
                            <span v-if="outdated && outdated.length && outdated.find((m: any) => m.name === module.name)"
                                class="mx-0.5"
                                >
                                <span>→</span>
                                <span class="font-bold mx-0.5">{{ outdated.find((m: any) => m.name === module.name)?.latest }}</span>
                            </span>

                        </p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button v-if="outdated?.some((update: any) => update.name === module.name)" class="text-xs text-[var(--vscode-textLink-foreground)]" :aria-label="`Release notes for ${module.name}`" @click="releaseNotes(module.name)">Release notes</button>
                        <button class="hidden cursor-pointer hover:opacity-80 group-hover:block group-hover:font-medium"
                            @click="removeModule(module.name)">
                            <IconTrash class="h-4 w-4" />
                        </button>
                        <button class="hidden cursor-pointer hover:opacity-80 group-hover:block group-hover:font-medium"
                            @click="upgradeModule(module.name)">
                            <IconUpgrade class="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, PropType } from "vue";
import IconChevron from "../../Icons/Chevron.vue";
import IconUpgrade from "../../Icons/Upgrade.vue";
import IconTrash from "../../Icons/Trash.vue";
import IconNPM from "../../Icons/NPM.vue";
import IconModule from "../../Icons/Module.vue";
import { vscode } from "../../../utilities/vscode";

const isSectionOpened = ref(false);
/** Expand or collapse the dependency section. */
const expandSection = () => {
    isSectionOpened.value = !isSectionOpened.value;
};

// interface for dependencies
interface Module {
    name: string;
    version: string;
}

interface OutdatedModule {
    current: string;
    dependent: string;
    latest: string;
    wanted: string;
}

defineProps({
    name: {
        type: String,
    },
    dependencies: {
        type: Array as PropType<Module[]>,
    },
    outdated: {
        type: Array as PropType<OutdatedModule[]> | any,
    },
});

/** Request an upgrade through the selected project manager. */
const upgradeModule = (module: string) => {
    vscode.postMessage({
        command: "upgradeModule",
        module,
    });
};

/** Request confirmed removal through the selected project manager. */
const removeModule = (module: string) => {
    vscode.postMessage({
        command: "removeModule",
        module,
    });
};
/** Open verified repository releases, with an npm page fallback. */
function releaseNotes (name: string) { vscode.postMessage({ command: 'openPackageReleaseNotes', name }); }
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
