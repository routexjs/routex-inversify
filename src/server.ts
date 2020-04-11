import * as inversify from "inversify";
import * as routex from "routex";
import { IRoutexOptions } from "routex/dist/types/routex";
import * as interfaces from "./interfaces";
import { TYPE, METADATA_KEY } from "./constants";

export interface IRoutexInversifyOptions {
  app?: routex.Routex;
  routexOptions?: IRoutexOptions;
  /// Should start with `/`
  defaultRoot?: string;
}

export class RoutexInversifyServer {
  private readonly container: inversify.interfaces.Container;
  private readonly app: routex.Routex;
  private readonly defaultRoot: IRoutexInversifyOptions["defaultRoot"];

  constructor(
    container: inversify.interfaces.Container,
    options?: IRoutexInversifyOptions
  ) {
    this.container = container;
    this.app = options?.app ?? new routex.Routex(options?.routexOptions);
    this.defaultRoot = options?.defaultRoot;
  }

  public build(): routex.Routex {
    this.registerControllers();

    return this.app;
  }

  private registerControllers() {
    const router = this.defaultRoot
      ? this.app.child(this.defaultRoot)
      : this.app;

    const controllers = this.container.getAll<object>(TYPE.Controller);

    controllers.forEach((controller) => {
      const controllerMetadata: interfaces.IControllerMetadata = Reflect.getOwnMetadata(
        METADATA_KEY.controller,
        controller.constructor
      );

      const methodMetadatas: interfaces.IControllerMethodMetadata[] = Reflect.getOwnMetadata(
        METADATA_KEY.controllerMethod,
        controller.constructor
      );

      if (controllerMetadata && methodMetadatas) {
        const controllerMiddleware = this.resolveMiddlewares(
          controllerMetadata.middlewares
        );

        const controllerRouter = router.child(controllerMetadata.path ?? "/");

        controllerRouter.middleware(controllerMiddleware);

        methodMetadatas.forEach((methodMetadata) => {
          const handler = this.resolveHandler(
            controllerMetadata.target.name,
            methodMetadata.key
          );

          const routeMiddleware = this.resolveMiddlewares(
            methodMetadata.middlewares
          );

          controllerRouter.route(
            methodMetadata.method,
            methodMetadata.path,
            [...routeMiddleware, handler.bind(controller)],
            methodMetadata.options
          );
        });
      }
    });
  }

  private resolveMiddlewares(middlewares?: interfaces.IMiddleware[]) {
    if (!middlewares) {
      return [];
    }

    return middlewares.map((middleware) => {
      try {
        const resolvedMiddleware = this.container.get<
          routex.Middleware | interfaces.InjectableMiddleware
        >(middleware);

        if ("middleware" in resolvedMiddleware) {
          return resolvedMiddleware.middleware;
        }

        return resolvedMiddleware;
      } catch {
        return middleware as routex.Middleware;
      }
    });
  }

  private resolveHandler(
    controllerName: string | number | symbol,
    key: string
  ): routex.Handler {
    return (this.container.getNamed(TYPE.Controller, controllerName) as any)[
      key
    ];
  }
}
