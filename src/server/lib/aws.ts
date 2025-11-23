import {
  type _InstanceType,
  DescribeInstancesCommand,
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";

interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface CreateParams {
  instanceType: string;
  publicKey: string;
  nameTag: string;
}

const AMI_MAP: Record<string, string> = {
  "us-west-2": "ami-0efcece6bed30fd98",
  default: "ami-0efcece6bed30fd98",
};

const CUSTOM_SECURITY_GROUP_ID = "sg-04559d4e0c93cc674";

export async function createAwsInstance(
  config: AwsConfig,
  params: CreateParams,
) {
  const region = config.region || "us-west-2";
  const client = new EC2Client({
    region: region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const userDataScript = `#!/bin/bash
mkdir -p /home/ubuntu/.ssh
echo "${params.publicKey}" >> /home/ubuntu/.ssh/authorized_keys
chmod 600 /home/ubuntu/.ssh/authorized_keys
chown -R ubuntu:ubuntu /home/ubuntu/.ssh
  `;

  const imageId = AMI_MAP[region] ?? AMI_MAP.default;

  console.log(
    `[AWS] Creating instance in ${region} using SG: ${CUSTOM_SECURITY_GROUP_ID}`,
  );

  const command = new RunInstancesCommand({
    ImageId: imageId,
    InstanceType: params.instanceType as _InstanceType,
    MinCount: 1,
    MaxCount: 1,
    UserData: Buffer.from(userDataScript).toString("base64"),

    // HERE IS THE CHANGE: We forcefully attach your specific Security Group
    SecurityGroupIds: [CUSTOM_SECURITY_GROUP_ID],

    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: params.nameTag }],
      },
    ],
  });

  try {
    const data = await client.send(command);
    const instanceId = data.Instances?.[0]?.InstanceId;
    return { instanceId, success: true };
  } catch (error) {
    console.error(`AWS Creation Error in ${region}:`, error);
    throw error;
  }
}

export async function getAwsPublicIp(
  config: AwsConfig,
  instanceId: string,
): Promise<string | undefined> {
  const client = new EC2Client({
    region: config.region || "us-west-2",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });

  const data = await client.send(command);
  const instance = data.Reservations?.[0]?.Instances?.[0];
  return instance?.PublicDnsName ?? instance?.PublicIpAddress;
}

export async function terminateAwsInstance(
  config: AwsConfig,
  instanceId: string,
) {
  const client = new EC2Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  const command = new TerminateInstancesCommand({
    InstanceIds: [instanceId],
  });

  try {
    console.log(`[AWS] Terminating instance ${instanceId}...`);
    await client.send(command);
    return { success: true };
  } catch (error) {
    console.error(`[AWS] Termination Error for ${instanceId}:`, error);
    // We don't throw here to allow the cleanup process to continue for other nodes
    return { success: false, error };
  }
}
