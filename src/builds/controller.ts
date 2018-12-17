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

    try {
      console.log("Creating runner...");
      const env = {
        GIT_REF: pushEvent.ref || "refs/heads/master",
        REPO_URL: pushEvent.repository.clone_url,
      };

      console.log(env);
      const runner = new Runner({
        command: ["/builder/build-scripts/init.sh"],
        env,
        image,
      });

      console.log("Starting runner...");
      await runner.start();

      console.log("Starting logging...");
      runner.followContainerLogs();

    } catch (err) {
      console.error(err);
    }

    return { success: true };
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
