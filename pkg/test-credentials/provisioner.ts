import { IClusterProvisioner, ClusterProvisionerContext } from '@shell/core/types';
import { CAPI as CAPI_ANNOTATIONS } from '@shell/config/labels-annotations';
import CredentialSection from './components/CredentialSection.vue';
import InfrastructureSection from './components/InfrastructureSection.vue';
import {
  PROVIDER, CREDENTIAL_ANNOTATION, CREDENTIAL_NAMESPACE, INFRASTRUCTURE_API_VERSION, INFRASTRUCTURE_KIND, MACHINE_TEMPLATE_KIND, parseCredentialId
} from './types';

const [MACHINE_TEMPLATE_GROUP, MACHINE_TEMPLATE_VERSION] = INFRASTRUCTURE_API_VERSION.split('/');

/**
 * Sample provisioner that exercises `extensionCredentialSection`
 *
 * Credentials are labelled secrets, not Rancher cloud credentials. No CAPI provider backs this sample:
 * `provision` saves the cluster without machine pools, so nothing is provisioned
 */
export class TestCredentialsProvisioner implements IClusterProvisioner {
  static ID = PROVIDER;

  constructor(private context: ClusterProvisionerContext) {}

  get id(): string {
    return TestCredentialsProvisioner.ID;
  }

  get group(): string {
    return 'capi';
  }

  get description(): string {
    return this.context.t('testCredentials.description');
  }

  get isUpstreamCAPIProvider(): boolean {
    return true;
  }

  get detailTabs(): any {
    return {
      machines:     false,
      logs:         false,
      registration: false,
      snapshots:    false,
      related:      true,
      events:       true,
      conditions:   true,
    };
  }

  get extensionCredentialSection(): any {
    return CredentialSection;
  }

  get extensionCredentialSectionProps(): any {
    return { namespace: CREDENTIAL_NAMESPACE };
  }

  get extensionInfrastructureSection(): any {
    return InfrastructureSection;
  }

  // An object (rather than a schema id): there is no CRD behind this sample
  get machineConfigSchema(): { [key: string]: any } {
    return {
      id:         `rke-machine-config.cattle.io.${ PROVIDER }config`,
      attributes: {
        kind:    MACHINE_TEMPLATE_KIND,
        group:   MACHINE_TEMPLATE_GROUP,
        version: MACHINE_TEMPLATE_VERSION,
      },
    };
  }

  async createMachinePoolMachineConfig(): Promise<{ [key: string]: any }> {
    return {
      apiVersion: INFRASTRUCTURE_API_VERSION,
      kind:       MACHINE_TEMPLATE_KIND,
      metadata:   {},
      spec:       {},
    };
  }

  registerInitHooks(registerInitHook: any): void {
    registerInitHook(async function(this: any) {
      const credentialId = this.value?.metadata?.annotations?.[CREDENTIAL_ANNOTATION] || null;
      const identityRef = parseCredentialId(credentialId);

      this.infrastructureCluster = {
        apiVersion: INFRASTRUCTURE_API_VERSION,
        kind:       INFRASTRUCTURE_KIND,
        metadata:   {},
        spec:       identityRef ? { identityRef: { kind: 'Secret', ...identityRef } } : {},
      };

      // Initial value of the credential section when editing an existing cluster
      if (credentialId) {
        this.credentialId = credentialId;
      }
    }, 'test-credentials-init');
  }

  async provision(cluster: any): Promise<any[]> {
    cluster.metadata.annotations = {
      ...(cluster.metadata.annotations || {}),
      // Edit resolves the cluster back to this provisioner through this annotation
      [CAPI_ANNOTATIONS.UI_CUSTOM_PROVIDER]: PROVIDER,
    };

    // Nothing backs the machine templates, so save the cluster without machines
    cluster.spec.rkeConfig.machinePools = [];

    try {
      await cluster.save();

      return [];
    } catch (e) {
      return [e];
    }
  }
}
