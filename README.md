# Resource Routing

The Resource Routing package provides a way to a build simple, easy restful route suite for nodejs & expressjs, with a viewable routing table.

# Summary

Resource Routing provides:

* A simple, easy method for generating restful routes for a model
* Viewable routing table
* Customize, override and extend the default restful routes
* Opt-in interface for creating non-restful routes, so you don't have to build routes in different ways.
* Easy declaration of your "root" or "home" route.

# Installation

    npm install resource-routing

or 

    yarn add resource-routing

# Usage
Create a new router for your app:

## ESM
    import express from "express"
    import path from "path";
    import Router from "resource-routing"

    const app = express()
    const controllerDir = path.resolve("./controllers", 'js')
    const router = new Router(app, controllerDir)

## CJS
    const express = require('express')
    const path = require('path')
    const Router = require('resource-routing').default // NOTE THE .default here

    const app = express()
    const controllerDir = path.resolve("./controllers")
    const router = new Router(app, controllerDir, 'js')

The router expects all controllers to be in the same directory. A good recommendation is `PROJECT_ROOT/controllers` or `PROJECT_ROOT/app/controllers`.

## .resources(entity | entity[], options?)
The router expects all controllers to be named with common convention of [entities]_controller.js, like `posts_controller.rb` or `comments_controller.rb`

The router depends on the express.js engine.

The `resources()` method takes one or two parameters.

The first parameter is a string reprensenting is the entity/class/model_name, in pluralized form, that will have restful routes.

The first parameter may also be an array strings representing a nested route defintion. More on nested routes below.

Example simple usage:

    router.resources("users")

You now have restful routing for your User model.

This will build the 18 standard restful routes for you:

    Method  URL                       Handler
    GET     /users                    users_controller.index
    GET     /users.:format            users_controller.index
    GET     /users/new                users_controller.new
    GET     /users/new.:format        users_controller.new
    POST    /users                    users_controller.create
    POST    /users.format             users_controller.create
    GET     /users/:id                users_controller.show
    GET     /users/:id.:format        users_controller.show
    GET     /users/:id/edit           users_controller.edit
    GET     /users/:id/edit.:format   users_controller.edit
    PUT     /users/:id                users_controller.update
    POST    /users/:id                users_controller.update
    PATCH   /users/:id                users_controller.update
    PUT     /users/:id.:format        users_controller.update
    POST    /users/:id.:format        users_controller.update
    PATCH   /users/:id.:format        users_controller.update
    DELETE  /users/:id                users_controller.destroy
    DELETE  /users/:id.:format        users_controller.destroy

If the controller does not exist, it will raise an error on start up.

If the expected controller function does not exist, it will raise an error on start up.

The functions should be defined as normal express request handlers with request and response parameters:

    function(req, res) {};

The `options` parameter recognizes these keys:

### `except`

An array of standard route names. These standard routes
will be excluded from the route creation process. They will **not be created**.

Example:

    router.resources("users", { except: ["delete"] });

This will create six of the seven standard routes, plus their `.format` variants, but the `delete` route
will not be created.

### `only`
An array of standard route names. **ONLY** these standard routes
will be created. Other standard routes not included in this list will be excluded from the route creation process.

Example:

    router.resources("users", { only: ["index", "show"] } );

This will suppress creation of the `new`, `create`,
`update`, `edit`, and `delete` routes. In this case, only the `index` and `show` from the default set will be created.

If `only` is included in the options, the `except` option is ignored.

### `memberActions`

If you need add additional custom member routes, you can declare them with the `memberActions` options attribute. It takes an array of custom route definitions, and each custom route defintions needs a `method`, an `action` (or function name), and option path `path`. If the path is not provide, the route creation will use the `action` string for the `action` and the `path`.

* The `method` is the HTTP method ('GET', 'POST', 'PUT', 'DELETE'),
* The `action` is method or function name of the controller to be called
* The `path`, if included, URL part to be appended to the entity's base URL. If not defined, it use the `action` string as the URL

Example:

    router.resources("users", { memberActions:[
        {method: "GET", action: "foo", path: "bar"},
        {method: "GET", action: "baz"}
      ]
    });

Will generate (in addition to the regular routes):

    Method  URL                       Handler
    get     /users/:id/foo            users_controller.bar
    get     /users/:id/foo.:format    users_controller.bar
    get     /users/:id/baz            users_controller.baz
    get     /users/:id/baz.:format    users_controller.baz

### `collectionActions`
If you need additional custom collection routes, you can declare them with the `collectionActions` options attribute. It works the same way as the member attribute, but the base URL used does not include :id. Instead it uses the general controller URL.

Example:

    router.resources("users", {collectionActions: [
      { method: "GET", action: "reset_request", path: "reset" }
    ]});

Will generate:

    Method    URL                           Handler
    get       /users/reset_request          users_controller.reset
    get       /users/reset_request.:format  users_controller.reset

### `using`

Overrides the automatic model-to-controller conversion (where passing in "users" will automatically try to load "users_controller") and let's you declare which controller you will be using.

For example:

    router.resources("users", { using: "members" });

Will create:

    Method  URL                       Handler
    get     /users                    members_controller.index
    get     /users.:format            members_controller.index
    get     /users/new                members_controller.new
    get     /users/new.:format        members_controller.new
    [etc]


### `prefix`

Optional. When defined, it is prepended to the generated URL path. This is useful for namespacing or URL versioning:

For example:

    router.resources("users", { prefix: "api/1.0" });

Will create:

    Method  URL                       Handler
    get     /api/1.0/users                    users_controller.index
    get     /api/1.0/users.:format            users_controller.index
    get     /api/1.0/users/new                users_controller.new
    get     /api/1.0/users/new.:format        users_controller.new
    [etc]

### Declaring nested resources
Nested resources are supported. By passing more than the minimum number of paramaters, the extra strings are assumed to be parent resources. For example, a call like:

    router.resources(["users", "posts"])

Resource Routing will build the routes for posts, as a nested
resource for tables and users, and the request will include resource
ids for the parent resourses.

These are the routes that will get created with that method call:

    Method  URL                                                        Handler
    GET     /users/:userId/posts                   PostsController.index
    GET     /users/:userId/posts.format            PostsController.index
    GET     /users/:userId/posts/new               PostsController.new
    GET     /users/:userId/posts/new.format        PostsController.new
    POST    /users/:userId/posts                   PostsController.create
    POST    /users/:userId/posts.format            PostsController.create
    GET     /users/:userId/posts/:id               PostsController.show
    GET     /users/:userId/posts/:id.format        PostsController.show
    GET     /users/:userId/posts/:id/edit          PostsController.edit
    GET     /users/:userId/posts/:id/edit.format   PostsController.edit
    PUT     /users/:userId/posts/:id               PostsController.update
    PUT     /users/:userId/posts/:id.format        PostsController.update
    PATCH   /users/:userId/posts/:id               PostsController.update
    PATCH   /users/:userId/posts/:id.format        PostsController.update
    POST    /users/:userId/posts/:id               PostsController.update
    POST    /users/:userId/posts/:id.format        PostsController.update
    DELETE  /users/:userId/posts/:id               PostsController.destroy
    DELETE  /users/:userId/posts/:id.format        PostsController.destroy

NOTE: None of the 'parent' resource routes gets created. They will need their own call to the `resources` have them defined, like so:

    router.resources("users");
    router.resources(["users", "posts"]);
    router.resources(["users", "posts", "comments"]);

## root

Declare your root or home URL with the .root() method:

    router.root("index", "home");

This creates multiple routes to IndexController.home.

    GET   /                   index_controller.home
    GET   /index.:format      index_controller.home
    GET   /index              index_controller.home

## Arbitrary routes (get, post, put, delete):

You can declare all arbitrary non-restful routes through the resource-routing interface instead of directly through the express app object.

There are two reasons to do this:

1. Consistency in declaring routes in your applications
1. Arbitrary routes declared through resource-routing are added to the renderable routing table.

Example:

Instead of doing this:

    import sessionsController from "./controllers/sessions_controller";
    app.get("/login", sessions_controller.login)
    app.post("/logout", sessions_controller.logout)

Do this:

    router.get("/login", "sessions#login")
    router.get("/logout", "sessions#logout")

It will generate the expected routes:

    Method    URL                 Handler
    get       /login          sessions_controller.login
    get       /login.:format  sessions_controller.logout

## `exposeRoutingTable`
If you have a lot of generated resource routes, you many want or need a convenient way to see all the routes. Resource Routing
give you a way to do this.

    import express from 'express'
    const app = express();
    import path from "path";
    const app = express()
    const controllerDir = path.resolve("./controllers")
    import Router from'resource-routing'
    
    const router = new Router(app, controllerDir)
    router.exposeRoutingTable();

This enables a display of the routing table at a default location of: `/routingTable`. This displays an html table of all the internally generated routes. It does NOT include routes not added by resource-routing.

You can override the location of the routing table by passing a string paramater:

    router.exposeRoutingTable("/myRoutes");

Some users may want to conditionally enable it. (i.e. in development, but not in production);

# Authors
* Steven Hilton <mshiltonj@gmail.com>, mastodon: [@mshiltonj](https://mastodon.online/@mshiltonj)

# LICENSE

See [License](LICENSE)

# ChangeLog

See [Changelog](CHANGELOG)




