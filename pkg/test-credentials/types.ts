export const PROVIDER = 'testcredentials';

// credentials are secrets with this label, in this namespace
export const CREDENTIAL_NAMESPACE = 'fleet-default';
export const CREDENTIAL_LABEL = 'test-credentials.example.com/credential';

// `<namespace>/<name>` of the credential secret
// stored on the provisioning cluster because this sample has no infrastructure cluster resource to keep it on
export const CREDENTIAL_ANNOTATION = 'test-credentials.example.com/credential';

export const INFRASTRUCTURE_API_VERSION = 'infrastructure.cluster.x-k8s.io/v1beta1';
export const INFRASTRUCTURE_KIND = 'TestCredentialsCluster';
export const MACHINE_TEMPLATE_KIND = 'TestCredentialsMachineTemplate';

export function parseCredentialId(id?: string | null): { namespace: string, name: string } | null {
  const [namespace, name] = (id || '').split('/');

  return namespace && name ? { namespace, name } : null;
}
