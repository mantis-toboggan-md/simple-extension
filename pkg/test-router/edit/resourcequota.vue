
<script>
export default {
  name: 'ResourceQuota',

  computed: {
    currentUrl() {
      return this.$router.currentRoute.value.fullPath;
    }
  }
};
</script>

<template>
  <div>{{ currentUrl }}</div>
</template>
