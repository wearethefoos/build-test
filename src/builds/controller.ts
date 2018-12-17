import * as config from "config";
import {
  Body,
  Get,
  HttpCode,
  JsonController,
  Post,
} from "routing-controllers";

import { Runner } from "../docker/runner";
import { IPushEvent } from "../lib/github";
import Build from "./entity";

export interface IBuildTriggerConfig {
  image: string;
}

const options: IBuildTriggerConfig = config.get("build-trigger");

@JsonController()
export default class BuildsController {
  @Post("/builds")
  @HttpCode(201)
  public async createBuild(
    @Body() pushEvent: IPushEvent,
  ) {
    const { image } = options;

    const build = Build.create({
      command: ["/builder/build-scripts/init.sh"],
      gitRef: pushEvent.ref,
      image,
      repoUrl: pushEvent.repository.clone_url,
    });

    return build.save();
  }

  @Get("/test")
  public async test() {
    try {
      console.log("Creating runner...");
      const runner = new Runner({
        image: "library/hello-world",
      });

      console.log("Starting runner...");
      await runner.start();

      console.log("Starting logging...");
      runner.followContainerLogs();

      return { success: true };

    } catch (err) {
      console.error(err);
    }
  }
}
