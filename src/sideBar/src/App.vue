<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

// import Modules from "./components/Modules.vue";
const router = useRouter();
// router.push("/");

window.addEventListener("message", (event: any) => {
  const message = event.data;
  switch (message.command) {
    case "modules":
      router.push("/");
      break;
    case "projectView":
      router.push("/project");
      break;
  }
});
</script>
