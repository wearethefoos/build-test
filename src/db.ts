// src/db.ts
import * as config from "config";
import { createConnection } from "typeorm";
import { DefaultNamingStrategy } from "typeorm/naming-strategy/DefaultNamingStrategy";
import { NamingStrategyInterface } from "typeorm/naming-strategy/NamingStrategyInterface";
import { snakeCase } from "typeorm/util/StringUtils";

import Build from "./builds/entity";

class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

  public tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName) + "s";
  }

  public columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCase(embeddedPrefixes.concat(customName ? customName : propertyName).join("_"));
  }

  public columnNameCustomized(customName: string): string {
    return customName;
  }

  public relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }
}

export default () =>
  createConnection({
    entities: [
      Build,
    ],
    logging: true,
    namingStrategy: new CustomNamingStrategy(),
    synchronize: true,
    type: "postgres",
    url: process.env.DATABASE_URL || config.get("database.url"),
  })
    .then(_ => console.log("Connected to Postgres with TypeORM"));
