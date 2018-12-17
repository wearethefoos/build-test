import "reflect-metadata";

import { Server } from "http";
import * as Koa from "koa";
import { useKoaServer } from "routing-controllers";
import * as IO from "socket.io";

import setupDb from "./db";

import BuildsController from "./builds/controller";

const app = new Koa();
const server = new Server(app.callback());
export const io = IO(server);
const port = process.env.PORT || 3030;

useKoaServer(app, {
  controllers: [
    BuildsController,
  ],
});

io.on("connect", socket => {
  console.log(`Client connected`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected`);
  });
});

setupDb()
  .then(_ => {
    server.listen(port);
    console.log(`Builder listening on port ${port}`);
  })
  .catch(err => console.error(err));
