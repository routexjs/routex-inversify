import { injectable } from "inversify";
import { ICtx, JsonBody, TextBody } from "routex";
import {
  Controller,
  Delete,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
} from "../src";

@Controller()
@injectable()
export class BasicTestController {
  @Get("/name/:name")
  name(ctx: ICtx) {
    return new JsonBody({ name: ctx.params.name });
  }
}

@Controller("/child")
@injectable()
export class ChildTestController {
  @Get("/name/:name")
  name(ctx: ICtx) {
    return new JsonBody({ name: ctx.params.name });
  }
}

function middleware1(ctx: ICtx) {
  ctx.data.name = "john";
}

function middleware2(ctx: ICtx) {
  ctx.data.name += "doe";
}

@Controller("/middleware", [middleware1, "globalMiddleware1"])
@injectable()
export class MiddlewareTestController {
  @Get("/name", [middleware2, "globalMiddleware2"])
  name(ctx: ICtx) {
    return new JsonBody({ name: ctx.data.name });
  }
}

@Controller()
@injectable()
export class MethodTestController {
  @Get("/")
  get() {
    return new TextBody("GET");
  }
  @Post("/")
  post() {
    return new TextBody("POST");
  }
  @Put("/")
  put() {
    return new TextBody("PUT");
  }
  @Patch("/")
  patch() {
    return new TextBody("PATCH");
  }
  @Head("/")
  head() {
    return new TextBody("HEAD");
  }
  @Delete("/")
  delete() {
    return new TextBody("DELETE");
  }
  @Options("/")
  options() {
    return new TextBody("OPTIONS");
  }
}

@Controller()
@injectable()
export class DataTestController {
  @Get("/")
  name(ctx: ICtx) {
    return new JsonBody({ name: ctx.data.name });
  }
}

@injectable()
export class EmptyTestController {}

@Controller()
@injectable()
export class DataMiddlewareTestController {
  @Get("/", ["TestMiddleware"])
  name(ctx: ICtx) {
    return new JsonBody({ name: ctx.data.name });
  }
}

@Controller()
@injectable()
export class ThisTestController {
  name = "john";

  @Get("/")
  getName(ctx: ICtx) {
    return new JsonBody({ name: this.name });
  }
}
