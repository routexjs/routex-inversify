import { injectable } from "inversify";
import { ICtx } from "routex";
import { Controller, interfaces } from "../src";

@Controller()
@injectable()
export class TestMiddleware implements interfaces.InjectableMiddleware {
  middleware(ctx: ICtx) {
    ctx.data.name = "john";
  }
}
