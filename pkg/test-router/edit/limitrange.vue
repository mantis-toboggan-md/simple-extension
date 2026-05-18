<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentUrl = computed(() => router.currentRoute.value.fullPath);
</script>


<template>
  <div>{{ currentUrl }}</div>
</template>