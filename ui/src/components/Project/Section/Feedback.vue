<template>
    <div class="my-0.5 h-40  flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
        <div class="mx-auto mb-2.5 mt-1 flex w-11/12 flex-col items-start justify-start ">
            <div class=" flex flex-1 flex-row items-center gap-1 hover:bg-[var(--vscode-list-hoverBackground)]">
                <IconMessage class="h-5 w-5" />
                <p class="text-sm font-medium">Feedback</p>
            </div>
            <textarea
                class="mt-3 w-full resize-none rounded-md border border-[var(--vscode-dropdown-border)] bg-transparent px-2 py-1 text-xs font-medium text-[var(--vscode-foreground)] placeholder-[var(--vscode-disabledForeground)] placeholder-opacity-50 transition-all"
                placeholder="What do you think about Nuxtr?" v-model="userFeedback" name="feedback" id="feedback" cols="5" rows="4"></textarea>

            <button v-if="!messageSent"
                class="mt-4 h-[27.73px] w-full rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-foreground)] text-[var(--vscode-sideBar-background)]  text-xs font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                v-text="'Send Feedback'" @click.prevent="sendFeedback" :disabled="!userFeedback" />

            <p class="mt-4 text-xs font-medium text-[var(--vscode-foreground)]" v-if="messageSent">
                Thank you for your feedback!
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import IconMessage from "../../Icons/Message.vue";
import { supabase } from "../../../../src/lib/supabaseClient";


const userFeedback = ref("");
const messageSent = ref(false);

const props = defineProps({
    content: {
        type: Object,
        required: true,
    },
});



const sendFeedback = async () => {
    const { data, error } = await supabase.from("vscode_user_feedback").insert([
        {
            feedback_message: userFeedback.value,
            vscode_version: props.content.vscode_version,
            extension_version: props.content.extension_version,
            vscode_theme_id: props.content.vscode_theme_id,
        },
    ]);
    if (error) {
        console.log(error);
    } else {
        userFeedback.value = "";
        messageSent.value = true;
        setTimeout(() => {
            messageSent.value = false;
        }, 5000);
    }
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
