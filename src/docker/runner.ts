import chalk from "chalk";
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
  rm?: boolean;
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
  public logStream: Stream.PassThrough;
  public rm: boolean = true;

  constructor({ image, command, env, rm }: IRunner) {
    this.env = env || {};
    this.image = image;
    this.command = command;
    if (rm !== undefined) { this.rm = rm; }
  }

  public async start() {
    const container = await this.getContainer();
    this.logStream.push(chalk.grey("Starting container..."));
    return container.start();
  }

  public async stop() {
    const container = await this.getContainer();
    this.logStream.push(chalk.grey("Stopping container..."));
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

    this.logStream.push(chalk.grey("Attaching container logs..."));

    const stream = await container.logs({
      follow: true,
      stderr: true,
      stdout: true,
    });

    container.modem.demuxStream(stream, this.logStream, this.logStream);

    stream.on("end", async () => {
      console.log(chalk.grey("Stream ended."));
      if (this.rm) {
        this.remove();
      }
    });
  }

  public async remove() {
    const container = await this.getContainer();

    this.logStream.push(chalk.grey("Cleaning up container..."));
    await container.remove();
    this.logStream.end(chalk.green("Done!"));
  }

  private createEnv() {
    return Object.keys(this.env)
      .map(key => `${key}=${this.env[key]}`);
  }

  private createLogStream() {
    if (this.logStream) { return; }

    this.logStream = new Stream.PassThrough();

    this.logStream.on("data", chunk => {
      const logString = chunk.toString("utf8");
      console.log(logString);

      io.emit("container_logs", {
        container: this.container,
        data: logString,
      });
    });
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
    this.createLogStream();
  }
}
