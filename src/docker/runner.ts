import * as path from "path";
import * as Stream from "stream";

import { io } from "..";
import { docker } from "./client";

export interface IEnv {
  [envVar: string]: string;
}

export interface IRunner {
  image: string;
  command?: string[];
  env?: IEnv;
}

export class Runner {

  public static async removeContainer(containerId: string) {
    const container = await docker.getContainer(containerId);

    if (container) {
      console.log(`Removing container ${containerId}`);
      container.remove();
    }
  }

  public image: string;
  public container: string;
  public command: string[] | undefined;
  public env: IEnv = {};

  constructor({ image, command, env }: IRunner) {
    this.env = env || {};
    this.image = image;
    this.command = command;
  }

  public async start() {
    const container = await this.getContainer();
    return container.start();
  }

  public async stop() {
    const container = await this.getContainer();
    return container.stop();
  }

  public async getContainer() {
    if (!this.container) {
      await this.create();
    }

    return docker.getContainer(this.container);
  }

  public async followContainerLogs() {
    const container = await this.getContainer();

    // create a single stream for stdin and stdout
    const logStream = new Stream.PassThrough();

    logStream.on("data", chunk => {
      const logString = chunk.toString("utf8");
      console.log(logString);
      io.emit("container_logs", {
        container: this.container,
        data: logString,
      });
    });

    logStream.push("Starting container...");

    const stream = await container.logs({
      follow: true,
      stderr: true,
      stdout: true,
    });

    container.modem.demuxStream(stream, logStream, logStream);

    stream.on("end", () => {
      console.log("Stream ended!");
      logStream.end("!stop!");
      container.remove();
    });
  }

  private createEnv() {
    return Object.keys(this.env)
      .map(key => `${key}=${this.env[key]}`);
  }

  private async create() {
    const container = await docker.createContainer({
      Cmd: this.command,
      Env: this.createEnv(),
      HostConfig: {
        Binds: [
          `${path.resolve(__dirname, "../..")}/build-scripts:/builder/build-scripts`,
        ],
      },
      Image: this.image,
      Tty: true,
      Volumes: {
        "/builder/build-scripts": {},
      },
    });

    this.container = container.id;
  }
}
