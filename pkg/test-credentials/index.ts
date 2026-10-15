import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import { TestCredentialsProvisioner } from './provisioner';

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import machine-config and l10n from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  plugin.register('provisioner', TestCredentialsProvisioner.ID, TestCredentialsProvisioner);

  // No Rancher cloud credential for this provider
  // `extensionCredentialSection` must still show the credential step
  plugin.register('cloud-credential', TestCredentialsProvisioner.ID, false);
}
