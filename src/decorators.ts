import * as routex from "routex";
import { IRouteOptions } from "routex/dist/types/route";
import * as interfaces from "./interfaces";
import { METADATA_KEY } from "./constants";

export function Method(
  method: routex.Methods,
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return function (target: routex.Handler, key: string) {
    const metadata: interfaces.IControllerMethodMetadata = {
      path,
      options,
      middlewares,
      method,
      target,
      key,
    };

    let metadataList: interfaces.IControllerMethodMetadata[] = [];

    if (
      !Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)
    ) {
      Reflect.defineMetadata(
        METADATA_KEY.controllerMethod,
        metadataList,
        target.constructor
      );
    } else {
      metadataList = Reflect.getOwnMetadata(
        METADATA_KEY.controllerMethod,
        target.constructor
      );
    }

    metadataList.push(metadata);
  };
}

export function Controller(
  path?: string,
  middlewares?: interfaces.IMiddleware[]
) {
  return function (target: any) {
    const metadata: interfaces.IControllerMetadata = {
      path,
      middlewares,
      target,
    };
    Reflect.defineMetadata(METADATA_KEY.controller, metadata, target);
  };
}

export function Get(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.GET, path, middlewares, options);
}

export function Post(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.POST, path, middlewares, options);
}

export function Put(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.PUT, path, middlewares, options);
}

export function Patch(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.PATCH, path, middlewares, options);
}

export function Head(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.HEAD, path, middlewares, options);
}

export function Delete(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.DELETE, path, middlewares, options);
}

export function Options(
  path: string,
  middlewares?: interfaces.IMiddleware[],
  options?: IRouteOptions
): interfaces.IHandlerDecorator {
  return Method(routex.Methods.OPTIONS, path, middlewares, options);
}
