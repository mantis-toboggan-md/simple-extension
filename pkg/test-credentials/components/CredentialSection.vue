<script setup lang="ts">
/**
 * Credential step for the test-credentials provisioner
 *
 * Selects or creates a labelled secret. Exercises every part of the `extensionCredentialSection` contract:
 * value, validation, save (with a forced failure), back, and the provisioning / infrastructure cluster props
 */
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import LabeledSelect from '@shell/components/form/LabeledSelect.vue';
import { LabeledInput } from '@components/Form/LabeledInput';
import { Checkbox } from '@components/Form/Checkbox';
import { SECRET } from '@shell/config/types';
import { set } from '@shell/utils/object';
import { base64Encode } from '@shell/utils/crypto';
import { useI18n } from '@shell/composables/useI18n';
import { CREDENTIAL_LABEL, CREDENTIAL_ANNOTATION, parseCredentialId } from '../types';

const NEW = '_new';

type SaveFn = () => Promise<string[]>;

const props = defineProps<{
  value?: string | null;
  mode?: string;
  provider?: string;
  namespace: string;
  provisioningCluster?: any;
  infrastructureCluster?: any;
  registerSave?:(fn: SaveFn) => void;
  registerBack?:(fn: () => void) => void;
}>();

const emit = defineEmits(['update:value', 'validationChanged', 'canGoBackChanged']);

const store = useStore();
const { t } = useI18n(store);

const loading = ref(true);
const secrets = ref<{ label: string, value: string }[]>([]);
const selected = ref<string | null>(props.value || null);
const newName = ref('');
const newToken = ref('');
const failSave = ref(false);

const creating = computed(() => selected.value === NEW);

const options = computed(() => {
  const out = [{ label: t('testCredentials.credential.createNew'), value: NEW }, ...secrets.value];

  // Keep the current value selectable when its secret is not listed
  if (props.value && !secrets.value.find((s) => s.value === props.value)) {
    out.push({ label: props.value, value: props.value });
  }

  return out;
});

const valid = computed(() => {
  if (creating.value) {
    return !!newName.value && !!newToken.value;
  }

  return !!selected.value;
});

watch(valid, (val) => emit('validationChanged', val), { immediate: true });
watch(creating, (val) => emit('canGoBackChanged', val && !!secrets.value.length), { immediate: true });

watch(selected, (val) => {
  const credentialId = val === NEW ? null : val;

  writeCredentialReference(credentialId);
  emit('update:value', credentialId);
});

function writeCredentialReference(credentialId: string | null) {
  const identityRef = parseCredentialId(credentialId);

  if (props.provisioningCluster) {
    set(props.provisioningCluster, `metadata.annotations."${ CREDENTIAL_ANNOTATION }"`, credentialId || undefined);
  }

  if (props.infrastructureCluster) {
    set(props.infrastructureCluster, 'spec.identityRef', identityRef ? { kind: 'Secret', ...identityRef } : undefined);
  }
}

async function load() {
  try {
    const selector = encodeURIComponent(`${ CREDENTIAL_LABEL }=true`);
    const res = await store.dispatch('management/request', { url: `/v1/secrets/${ props.namespace }?labelSelector=${ selector }` });

    secrets.value = (res?.data || []).map((s: any) => {
      const id = `${ s.metadata.namespace }/${ s.metadata.name }`;

      return { label: id, value: id };
    });
  } finally {
    loading.value = false;
  }

  if (!selected.value && !secrets.value.length) {
    selected.value = NEW;
  }
}

async function save(): Promise<string[]> {
  if (failSave.value) {
    return [t('testCredentials.credential.failSave.error')];
  }

  const secret = await store.dispatch('management/create', {
    type:     SECRET,
    _type:    'Opaque',
    metadata: {
      namespace: props.namespace,
      name:      newName.value,
      labels:    { [CREDENTIAL_LABEL]: 'true' },
    },
    data: { token: base64Encode(newToken.value) },
  });

  await secret.save();

  const id = `${ props.namespace }/${ newName.value }`;

  secrets.value.push({ label: id, value: id });
  selected.value = id;

  return [];
}

props.registerSave?.(save);
props.registerBack?.(() => {
  selected.value = null;
});

load();
</script>

<template>
  <div data-testid="test-credentials-section">
    <div
      v-if="loading"
      data-testid="test-credentials-loading"
    >
      <i class="icon icon-spinner icon-spin" />
      {{ t('generic.loading') }}
    </div>
    <div
      v-else-if="creating"
      class="row"
    >
      <div class="col span-4">
        <LabeledInput
          v-model:value="newName"
          :label="t('testCredentials.credential.name')"
          :required="true"
          data-testid="test-credentials-name"
        />
      </div>
      <div class="col span-4">
        <LabeledInput
          v-model:value="newToken"
          type="password"
          :label="t('testCredentials.credential.token')"
          :required="true"
          data-testid="test-credentials-token"
        />
      </div>
      <div class="col span-4">
        <Checkbox
          v-model:value="failSave"
          :label="t('testCredentials.credential.failSave.label')"
          data-testid="test-credentials-fail-save"
        />
      </div>
    </div>
    <LabeledSelect
      v-else
      v-model:value="selected"
      :label="t('testCredentials.credential.label')"
      :options="options"
      :mode="mode"
      data-testid="test-credentials-select"
    />
  </div>
</template>
