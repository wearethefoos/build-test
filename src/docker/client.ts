import * as config from "config";
import * as Docker from "dockerode";

const dockerOpts: Docker.DockerOptions = config.get("docker");

export const docker = new Docker(dockerOpts);
