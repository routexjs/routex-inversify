import * as routex from "routex";
import { interfaces as inversifyInterfaces } from "inversify";
import { CallSite } from "callsites";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface InjectableMiddleware {
  middleware(ctx: routex.ICtx): Promise<void> | void;
}

export type IMiddleware =
  | inversifyInterfaces.ServiceIdentifier<any>
  | routex.Middleware;

export interface IControllerMetadata {
  path?: string;
  middlewares: IMiddleware[];
  target: any;
  callsite: CallSite;
}

export interface IControllerHandlerMetadata {
  path: string;
  options?: routex.IRouteOptions;
  middlewares: IMiddleware[];
  target: any;
  method: routex.Methods;
  key: string;
  callsite: CallSite;
}

export interface IHandlerDecorator {
  (target: any, key: string, value: any): void;
}

export interface IResolvedControllerHandlerMetadata
  extends IControllerHandlerMetadata {
  resolvedMiddlewares: routex.Middleware[];
}

export interface IResolvedControllerMetadata extends IControllerMetadata {
  resolvedHandlers: IResolvedControllerHandlerMetadata[];
  resolvedMiddlewares: routex.Middleware[];
  resolvedRouter: routex.Router;
}

export interface IRoutexServerMetadata {
  controllers: IResolvedControllerMetadata[];
}
