import * as routex from "routex";
import { interfaces as inversifyInterfaces } from "inversify";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface InjectableMiddleware {
  middleware(ctx: routex.ICtx): Promise<void> | void;
}

export type IMiddleware =
  | inversifyInterfaces.ServiceIdentifier<any>
  | routex.Middleware;

export interface IControllerMetadata {
  path?: string;
  middlewares?: IMiddleware[];
  target: any;
}

export interface IControllerMethodMetadata {
  path: string;
  options?: routex.IRouteOptions;
  middlewares?: IMiddleware[];
  target: any;
  method: routex.Methods;
  key: string;
}

export interface IHandlerDecorator {
  (target: any, key: string, value: any): void;
}
