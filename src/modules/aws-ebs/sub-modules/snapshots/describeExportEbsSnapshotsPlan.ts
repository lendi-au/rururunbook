import { describeSnapshotIds } from "./describeSnapshots";
import { describeVolumes } from "../volumes/describeVolumes";
import { EbsConfig } from "../config/EbsConfig";

export const describeExportEbsSnapshotsPlan = async (config: EbsConfig, instanceId: string): Promise<string> => {
  let message = config.transferAllSnapshots ? `All snapshots from` : `Latest snapshots`;
  message += `from the EBS volumes attached to instance ${instanceId} will be exported to audit account: \n`;

  if (config.sourceAwsRegion !== config.quarantineAwsRegion) {
    message += `These snapshots will first be copied to this region first: ${config.quarantineAwsRegion} \n`;
  }

  const volumes = await describeVolumes(instanceId);
  message += `Volumes: ${volumes} \n`;

  if (config.transferAllSnapshots) {
    for (const volume of volumes) {
      message += `${volume}: \n`;

      const snapshots = await describeSnapshotIds(volume);
      snapshots.forEach((snapshot: string | undefined) => {
        if (snapshot) {
          message += `  - ${snapshot}\n`;
        }
      });
    }
  }

  message += `All copied snapshots will then be exported to AWS Accounts: ${config.quarantineAwsAccounts}.`;
  return message;
};