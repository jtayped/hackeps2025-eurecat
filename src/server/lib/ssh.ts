import { NodeSSH } from "node-ssh";

export async function executeRemoteCommand(
  host: string,
  username: string,
  privateKey: string,
  commands: string[],
) {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host,
      username,
      privateKey,
      // readyTimeout: 20000, // Increase if connection is slow
    });

    const results = [];

    for (const cmd of commands) {
      console.log(`[SSH] Executing on ${host}: ${cmd}`);
      const result = await ssh.execCommand(cmd);
      results.push(result);

      if (result.code !== 0) {
        console.error(`[SSH Error] ${result.stderr}`);
        // Depending on strictness, you might want to throw here
      }
    }

    ssh.dispose();
    return results;
  } catch (error) {
    console.error("SSH Connection failed:", error);
    throw error;
  }
}

export const INSTALL_SCRIPTS = {
  // Option 1: Docker Swarm (The Easiest)
  DOCKER_SWARM: [
    "curl -fsSL https://get.docker.com -o get-docker.sh",
    "sudo sh get-docker.sh",
    "sudo usermod -aG docker ubuntu",
    // This command turns a normal Docker host into a Swarm Manager
    "sudo docker swarm init || echo 'Swarm already initialized'",
  ],

  // Option 2: K3s (The "Kubernetes" Standard)
  K3S: [
    // 1. Install K3s
    "curl -sfL https://get.k3s.io | sh -",

    // 2. Wait for startup
    "sleep 10",

    // 3. Copy config so 'kubectl' works for the 'ubuntu' user
    "mkdir -p /home/ubuntu/.kube",
    "sudo cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config",
    "sudo chown ubuntu:ubuntu /home/ubuntu/.kube/config",
    "sudo chmod 600 /home/ubuntu/.kube/config",

    // 4. Set alias so you can just type 'kubectl'
    "echo 'alias kubectl=\"k3s kubectl\"' >> /home/ubuntu/.bashrc",
  ],
};
