<script setup lang="ts">
/**
 * Shows what the credential section passed on: `credentialId` from rke2.vue and the identityRef the
 * credential section wrote to the infrastructure cluster
 */
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';

const props = defineProps<{
  value?: any;
  mode?: string;
  credentialId?: string | null;
  provisioningCluster?: any;
}>();

const emit = defineEmits(['validationChanged']);

const store = useStore();
const { t } = useI18n(store);

onMounted(() => emit('validationChanged', true));
</script>

<template>
  <div
    class="mb-20"
    data-testid="test-credentials-infrastructure"
  >
    <h3>{{ t('testCredentials.infrastructure.title') }}</h3>
    <div>
      {{ t('testCredentials.infrastructure.credentialId') }}:
      <code data-testid="test-credentials-infrastructure-credential-id">{{ props.credentialId || '-' }}</code>
    </div>
    <div>
      {{ t('testCredentials.infrastructure.identityRef') }}:
      <code data-testid="test-credentials-infrastructure-identity-ref">{{ props.value?.spec?.identityRef ? JSON.stringify(props.value.spec.identityRef) : '-' }}</code>
    </div>
  </div>
</template>
