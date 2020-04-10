# Routex Inversify [![npm](https://img.shields.io/npm/v/@routex/inversify.svg)](https://www.npmjs.com/package/@routex/inversify) [![Travis CI](https://img.shields.io/travis/com/routexjs/routex-inversify.svg)](https://travis-ci.com/routexjs/routex-inversify) [![Codecov](https://img.shields.io/codecov/c/github/routexjs/routex-inversify.svg)](https://codecov.io/gh/routexjs/routex-inversify)

Inversify decorator for [Routex](https://www.npmjs.com/package/routex).

[Documentation](https://routex.js.org/docs/packages/inversify) - [GitHub](https://github.com/routexjs/routex-inversify)

## Example

Install:

```bash
yarn add @routex/inversify
# or
npm add @routex/inversify
```

Setup your app:

```js
import "reflect-metadata";
import { ICtx, TextBody } from "routex";
import { RoutexInversifyServer, TYPE, Get, Controller } from "@routex/inversify";
import { injectable } from "inversify";

@injectable()
@Controller("/test")
class TestController {
  @Get("/name/:name")
  getName(ctx: ICtx) {
    return new TextBody(ctx.params.name);
  }
}

const container = new Container();

container
  .bind(TYPE.Controller)
  .to(TestController)
  .whenTargetNamed("TestController");

const server = new RoutexInversifyServer(container);

const port = process.env.PORT || 3000;

server
  .build()
  .listen(port)
  .then(() => console.log(`Listening on ${port}`));
```

## Support

We support all currently active and maintained [Node LTS versions](https://github.com/nodejs/Release),
include current Node versions.

Please file feature requests and bugs at the [issue tracker](https://github.com/routexjs/routex-inversify/issues).
