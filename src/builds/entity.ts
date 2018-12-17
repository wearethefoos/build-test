import { BeforeInsert, BeforeRemove, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";

import { Runner } from "../docker";

@Entity("builds")
export default class Build extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column("text", { nullable: false, name: "container_id" })
  public containerId: string;

  @Column("text", { nullable: false })
  public image: string;

  @Column("text", { nullable: false, array: true })
  public command: string[];

  @Column("text", { nullable: false, name: "repo_url" })
  public repoUrl: string;

  @Column("text", { nullable: false, name: "git_ref", default: "refs/heads/master" })
  public gitRef: string;

  @CreateDateColumn({ nullable: false, name: "created_at" })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: "updated_at" })
  public updatedAt: Date;

  @BeforeInsert()
  public async start() {
    try {
      console.log("Creating runner...");
      const env = {
        GIT_REF: this.gitRef || "refs/heads/master",
        REPO_URL: this.repoUrl,
      };

      console.log(env);
      const runner = new Runner({
        command: this.command,
        env,
        image: this.image,
      });

      console.log("Starting runner...");
      await runner.start();

      // store container id with the build
      this.containerId = runner.container;

      console.log("Starting logging...");
      runner.followContainerLogs();

    } catch (err) {
      console.error(err);
    }
  }

  @BeforeRemove()
  public removeContainer() {
    Runner.removeContainer(this.containerId);
  }
}
