<template>
  <div class="my-0.5 flex w-full select-none flex-col items-center text-[var(--vscode-foreground)]">
    <div class="flex w-full cursor-pointer flex-row items-center" @click="expandSection">
      <IconChevron class="h-2.5 w-2.5" :listOpen="isSectionOpened" />
      <div class="mx-2.5 flex flex-1 flex-row items-center gap-2 hover:bg-[var(--vscode-list-hoverBackground)]">
        <IconMessage class="h-4 w-4" />
        <p class="text-sm font-medium">Feedback</p>
      </div>
    </div>
    <Transition name="slide-down-fade">
      <div v-if="isSectionOpened" class="mx-auto mb-2.5 mt-1 w-11/12 pl-2"
        :class="{ showing: isSectionOpened, hidden: !isSectionOpened }">
        <div class="mx-auto mb-1.5 mt-1 flex w-full flex-col items-start justify-start">
          <textarea
            class="mt-3 w-full resize-none rounded-md border border-[var(--vscode-dropdown-border)] bg-transparent px-2 py-1 text-xs font-medium text-[var(--vscode-foreground)] placeholder-[var(--vscode-disabledForeground)] placeholder-opacity-50 transition-all"
            placeholder="What do you think about Nuxtr?" v-model="userFeedback" name="feedback" id="feedback" cols="5"
            rows="4"></textarea>

          <button v-if="!messageSent"
            class="mt-4 h-[27.73px] w-full rounded-md border border-[var(--vscode-dropdown-border)] bg-[var(--vscode-foreground)] text-[var(--vscode-sideBar-background)] text-xs font-medium transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            v-text="'Send Feedback'" @click.prevent="sendFeedback" :disabled="!userFeedback" />

          <p class="mt-4 text-xs font-medium text-[var(--vscode-foreground)]" v-if="messageSent">
            Thank you for your feedback!
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import IconMessage from "../../Icons/Message.vue";
import IconChevron from "../../Icons/Chevron.vue";
import { ofetch } from "ofetch";

const isSectionOpened = ref(false);
const expandSection = () => {
  isSectionOpened.value = !isSectionOpened.value;
};

const userFeedback = ref("");
const messageSent = ref(false);

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
});

type Response = { status: number; body: string };
const sendFeedback = async () => {
  const result: Response  = await ofetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    baseURL: "https://api.nuxtr.com",
    body: {
      feedback_message: userFeedback.value,
      vscode_version: props.content.vscode_version,
      extension_version: props.content.extension_version,
      vscode_theme_id: props.content.vscode_theme_id,
    },
  });

  if (result.status !== 200) {
    console.log('error', result);
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