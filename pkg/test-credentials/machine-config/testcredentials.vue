<script setup lang="ts">
/**
 * Machine config for the test-credentials provisioner
 * Only shows the `credentialId` that MachinePool passes through
 */
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from '@shell/composables/useI18n';

const props = defineProps<{
  value?: any;
  mode?: string;
  credentialId?: string | null;
}>();

const emit = defineEmits(['validationChanged']);

const store = useStore();
const { t } = useI18n(store);

onMounted(() => emit('validationChanged', true));
</script>

<template>
  <div data-testid="test-credentials-machine-config">
    {{ t('testCredentials.machineConfig.credentialId') }}:
    <code data-testid="test-credentials-machine-config-credential-id">{{ props.credentialId || '-' }}</code>
  </div>
</template>
