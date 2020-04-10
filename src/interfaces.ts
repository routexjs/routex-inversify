import * as routex from "routex";
import { IRouteOptions } from "routex/dist/types/route";
import { interfaces as inversifyInterfaces } from "inversify";

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
  options?: IRouteOptions;
  middlewares?: IMiddleware[];
  target: any;
  method: routex.Methods;
  key: string;
}

export interface IHandlerDecorator {
  (target: any, key: string, value: any): void;
}
