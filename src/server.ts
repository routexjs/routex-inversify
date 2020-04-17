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

  private metadata?: interfaces.IRoutexServerMetadata;

  constructor(
    container: inversify.interfaces.Container,
    options?: IRoutexInversifyOptions
  ) {
    this.container = container;
    this.app = options?.app ?? new routex.Routex(options?.routexOptions);
    this.defaultRoot = options?.defaultRoot;
  }

  public build(): routex.Routex {
    if (!this.metadata) {
      this.metadata = this.registerControllers();
    }

    return this.app;
  }

  private registerControllers(): interfaces.IRoutexServerMetadata {
    const router = this.defaultRoot
      ? this.app.child(this.defaultRoot)
      : this.app;

    const controllers = this.container.getAll<object>(TYPE.Controller);

    const resolvedControllers = controllers
      .map((controller): interfaces.IResolvedControllerMetadata | undefined => {
        // Get metadata from @Controller decorator
        const controllerMetadata: interfaces.IControllerMetadata = Reflect.getOwnMetadata(
          METADATA_KEY.controller,
          controller.constructor
        );

        // Get all @Method decorators from controller
        const handlerMetadatas: interfaces.IControllerHandlerMetadata[] = Reflect.getOwnMetadata(
          METADATA_KEY.controllerHandler,
          controller.constructor
        );

        if (controllerMetadata && handlerMetadatas) {
          const controllerMiddlewares = this.resolveMiddlewares(
            controllerMetadata.middlewares
          );

          const controllerRouter = router.child(controllerMetadata.path ?? "/");

          controllerRouter.middleware(controllerMiddlewares);

          const resolvedHandlers = handlerMetadatas.map(
            (
              handlerMetadata
            ): interfaces.IResolvedControllerHandlerMetadata => {
              const handler = (controller as any)[handlerMetadata.key];

              const handlerMiddlewares = this.resolveMiddlewares(
                handlerMetadata.middlewares
              );

              // Add route to controller router
              controllerRouter.route(
                handlerMetadata.method,
                handlerMetadata.path,
                [...handlerMiddlewares, handler.bind(controller)],
                handlerMetadata.options
              );

              return {
                ...handlerMetadata,
                resolvedMiddlewares: handlerMiddlewares,
              };
            }
          );

          return {
            ...controllerMetadata,
            resolvedHandlers,
            resolvedMiddlewares: controllerMiddlewares,
            resolvedRouter: controllerRouter,
          };
        }

        return undefined;
      })
      .filter(Boolean);

    return {
      controllers: resolvedControllers as interfaces.IResolvedControllerMetadata[],
    };
  }

  private resolveMiddlewares(middlewares: interfaces.IMiddleware[]) {
    return middlewares.map((middleware) => {
      try {
        const resolvedMiddleware = this.container.get<
          routex.Middleware | interfaces.InjectableMiddleware
        >(middleware);

        if ("middleware" in resolvedMiddleware) {
          return resolvedMiddleware.middleware.bind(resolvedMiddleware);
        }

        return resolvedMiddleware;
      } catch {
        return middleware as routex.Middleware;
      }
    });
  }

  public getMetadata() {
    this.build();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.metadata!;
  }
}
