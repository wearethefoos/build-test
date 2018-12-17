import "reflect-metadata";

import { Server } from "http";
import * as Koa from "koa";
import { useKoaServer } from "routing-controllers";
import * as IO from "socket.io";

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

server.listen(port);
console.log(`Builder listening on port ${port}`);
