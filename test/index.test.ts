import "reflect-metadata";
import { Container } from "inversify";
import { ICtx, default as routex, Routex } from "routex";
import * as request from "supertest";
import { RoutexInversifyServer, TYPE } from "../src";
import * as interfaces from "../src/interfaces";
import {
  BasicTestController,
  ChildTestController,
  DataMiddlewareTestController,
  DataTestController,
  EmptyTestController,
  MethodTestController,
  MiddlewareTestController,
  ThisTestController,
} from "./controllers";
import { TestMiddleware } from "./middleware";

it("Injects controllers & methods successfully", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(BasicTestController)
    .whenTargetNamed("BasicTestController");

  const server = new RoutexInversifyServer(container);

  return request(server.build().handler)
    .get("/name/john")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports defaultRoot & child router", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(ChildTestController)
    .whenTargetNamed("ChildTestController");

  const server = new RoutexInversifyServer(container, {
    defaultRoot: "/default",
  });

  return request(server.build().handler)
    .get("/default/child/name/john")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports middlewares", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(MiddlewareTestController)
    .whenTargetNamed("MiddlewareTestController");

  container.bind("globalMiddleware1").toConstantValue((ctx: ICtx) => {
    ctx.data.name += " h ";
  });

  container.bind("globalMiddleware2").toConstantValue((ctx: ICtx) => {
    ctx.data.name = ctx.data.name.toUpperCase();
  });

  const server = new RoutexInversifyServer(container);

  return request(server.build().handler)
    .get("/name")
    .expect(`{"name":"JOHN H DOE"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports all methods", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(MethodTestController)
    .whenTargetNamed("MethodTestController");

  const server = new RoutexInversifyServer(container);

  const handler = request(server.build().handler);

  return Promise.all([
    handler.get("/").expect(`GET`),
    handler.post("/").expect(`POST`),
    handler.put("/").expect(`PUT`),
    handler.patch("/").expect(`PATCH`),
    handler.head("/").expect(200),
    handler.delete("/").expect(`DELETE`),
    handler.options("/").expect(`OPTIONS`),
  ]);
});

it("Supports custom app", () => {
  const container = new Container();
  const app = new Routex();

  app.middleware((ctx: ICtx) => (ctx.data.name = "john"));

  container
    .bind(TYPE.Controller)
    .to(DataTestController)
    .whenTargetNamed("DataTestController");

  const server = new RoutexInversifyServer(container, { app });

  return request(server.build().handler)
    .get("/")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports empty controller", () => {
  const container = new Container();
  const app = new Routex();

  app.middleware((ctx: ICtx) => (ctx.data.name = "john"));

  container
    .bind(TYPE.Controller)
    .to(EmptyTestController)
    .whenTargetNamed("EmptyTestController");

  container
    .bind(TYPE.Controller)
    .to(BasicTestController)
    .whenTargetNamed("BasicTestController");

  const server = new RoutexInversifyServer(container);

  return request(server.build().handler)
    .get("/name/john")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports injectable middleware", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(DataMiddlewareTestController)
    .whenTargetNamed("DataMiddlewareTestController");

  container.bind("TestMiddleware").to(TestMiddleware);

  const server = new RoutexInversifyServer(container);

  return request(server.build().handler)
    .get("/")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});

it("Supports this", () => {
  const container = new Container();

  container
    .bind(TYPE.Controller)
    .to(ThisTestController)
    .whenTargetNamed("ThisTestController");

  const server = new RoutexInversifyServer(container);

  return request(server.build().handler)
    .get("/")
    .expect(`{"name":"john"}`)
    .expect("Content-Type", /json/)
    .expect(200);
});
