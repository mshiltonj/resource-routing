# Resource Routing

The Resource Routing package provides a way to build simple, easy restful routes for nodejs & expressjs, with a viewable routing table.

# Summary

Resource Routing provides:

* A simple, easy method for generating restful routes for a model
* Viewable routing table
* warnings if the expected controller or controller function does not exist
* Ways to customize, override and extend the generated restful routes
* The same interface for creating non-restful routes, so you don't have to build routes in different ways.
* Easy declaration of your "root" or "home" route.
* Optional definition of a global "wrapper" function around all the routes for universal request handling setup.

# Installation

    yarn add resource-routing

# Usage

## .resources(*)
Resource Routes expects all your controllers to be in the same directory. A good recommendation is `PROJECT_ROOT/controllers 
or PROJECT_ROOT/app/controllers`.

Resource Routes expects all controller to be named with common convention of [entities]_controller.js,
like `posts_controller.rb` or `comments_controller.rb`

For example, if you have a User resource or model you want to manage. Resource Routes expects you to manage it
with a `users_controller.js` file. If they don't match this convention, they may not be found.

Resource Routes depends on the express.js engine.

Example usage:

    // get your app
    import express from 'express';
    const app = express();
    
    // get your controller path. NOTE: resolve to full path
    imort path from 'path';
    const controllerDir = path.resolve("./controllers");
    
    // build your resource routing URLs
    import routing from 'resource-routing';
    routing.resources(app, controllerDir, "users");

That's it. You now have restful routing for your User model.

The resources() function takes a minimum of three parameters:

1. The express app object
2. The app controllers directory.
3. The entity/class/model_name, in pluralized form, that will have restful routes.

The simplest usage is:

    routing.resources(app, controller_dir, "users")

This will build the 18 standard restful routes for you:

    Method  URL                       Handler
    GET     /users                    users_controller.index
    GET     /users.format             users_controller.index
    GET     /users/new                users_controller.new
    GET     /users/new.format         users_controller.new
    POST    /users                    users_controller.create
    POST    /users.format             users_controller.create
    GET     /users/:id                users_controller.show
    GET     /users/:id.format         users_controller.show
    GET     /users/:id/edit           users_controller.edit
    GET     /users/:id/edit.format    users_controller.edit
    PUT     /users/:id                users_controller.update
    POST    /users/:id                users_controller.update
    PATCH   /users/:id                users_controller.update
    PUT     /users/:id.format         users_controller.update
    POST    /users/:id.format         users_controller.update
    PATCH   /users/:id.format         users_controller.update
    DELETE  /users/:id                users_controller.destroy
    DELETE  /users/:id.format         users_controller.destroy

If the controller does not exist, it will raise an error on start up.

If the expected controller function does not exist, it will raise an error on start up.

The functions should be defined as normal express request handlers:

    function(req, res) {};

A fourth parameter, an options object, may be included to add or restrict route creation.

Several option attributes are recognized:

### except

An array of standard route names. These standard routes
will be excluded from the route creation process. They will **not be created**.

Example:

    routing.resources(app, controller_use, "users", { except: ["delete"] });

This will create six of the seven standard routes, plus their `.format` variants, but the `delete` route
will not be created.

### only
An array of standard route names. **ONLY** these standard routes
will be created. Other standard routes not included in this list will be excluded from the route creation process.

Example:

    routing.resources(app, controller_use, "users", { only: ["index", "show"] } );

This will suppress creation of the `new`, `create`,
`update`, `edit`, and `delete` routes. In this case, only the `index` and `show` from the default set will be created.

If `only` is included in the options, the `except` option is ignored.

### memberActions

If you need add additional custom member routes, you can declare them with the `memberActions` options attribute. It takes an array of custom route definitions, and each custom route defintions needs a `method`, an `action` (or function name), and option path `path`. If the path is not provide, the route creation will use the `action` string for the `action` and the `path`.

* The `method` is the HTTP method ('GET', 'POST', 'PUT', 'DELETE'),
* The `action` is method or function name of the controller to be called
* The `path`, if included, URL part to be appended to the entity's base URL. If not defined, it use the `action` string as the URL

Example:

    routing.resources(app, controller_dir, "users", { memberActions:[
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

### collectionActions
If you need additional custom collection routes, you can declare them with the `collection`
options attribute. It works the same way as the member attribute, but the base URL used does not include :id.
Instead it uses the general controller URL.

Example:

    routing.resources(app, controller_dir, "users", {collectionActions: [
      { method: "GET", action: "reset_request", path: "reset" }
    ]});

Will generate:

    Method    URL                           Handler
    get       /users/reset_request          users_controller.reset
    get       /users/reset_request.:format  users_controller.reset

### using:

Overrides the automatic model-to-controller conversion (where passing in "users" will automatically try to load "users_controller") and let's you declare which controller you will be using.

For example:

    routing.resources(app, controllerDir, "users", { using: "members" });

Will create:

    Method  URL                       Handler
    get     /users                    members_controller.index
    get     /users.:format            members_controller.index
    get     /users/new                members_controller.new
    get     /users/new.:format        members_controller.new
    [etc]


### prefix:

Optional. When defined, it is prepended to the generated URL path. This is useful for namespacing or URL versioning:

For example:

    routing.resources(app, controllerDir, "users", { prefix: "api/1.0" });

Will create:

    Method  URL                       Handler
    get     /api/1.0/users                    users_controller.index
    get     /api/1.0/users.:format            users_controller.index
    get     /api/1.0/users/new                users_controller.new
    get     /api/1.0/users/new.:format        users_controller.new
    [etc]

### Declaring nested resources
Nested resources are supported. By passing more than the minimum number of paramaters, the extra strings are assumed to be parent resources. For example, a call like:

    routing.resources(app, controller_dir, ["users", "posts"], {}); // again, last param optional

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
    DELETE  /users/:userId/posts/:id               PostsController.destroy
    DELETE  /users/:userId/posts/:id.format        PostsController.destroy

NOTE: None of the 'parent' resource routes gets created. They will need their own call to the `resources` have them defined, like so:

    routing.resources(app, controller_dir, ["users"]);
    routing.resources(app, controller_dir, ["users", "posts"]);
    routing.resources(app, controller_dir, ["users", "posts", "comments"]);

## root

Declare your root or home URL with the .root() method:

    routing.root(app, controller_dir, "index", "home");

This creates multiple routes to IndexController.home.

    GET   /                   index_controller.home
    GET   /index.:format      index_controller.home
    GET   /index              index_controller.home

## Arbitrary routes (get, post, put, delete):

You can declare all arbitrary non-restful routes through the resource-routing interface.

There are two reasons to do this:

1. Consistency in declaring routes in your applications.
1. Arbitrary routes declared through resource-routing are added to the routing table.

Resource routing provides a light wrapper around the traditional route express.js declaration.


Example:

Instead of doing this:

    import sessionsController from "./controllers/sessions_controller";
    app.get("/login", sessions_controller.login)
    app.post("/logout", sessions_controller.logout)

Do this:

    routing.get(app, controllerDir, "/login", "sessions#login")
    routing.get(app, controllerDir, "/logout", "sessions#logout")

It will generate the expected routes:

    Method    URL                 Handler
    get       /login          sessions_controller.login
    get       /login.:format  sessions_controller.logout

## .expose_routing_table(app, options)

If you have a lot of generated resource routes, you many want or need a convenient way to see all the routes. Resource Routing
give you a way to do this.

    import express from 'express'
    const app = express();
    import routing from'resource-routing'    
    routing.expose_routing_table(app);

This enables a display of the routing table at a default location of: `/routing-table`. This display an html table of all the
internally generated routes. It does NOT include routes not added by resource-routing.

You can override the location of the routing table by passing an 'at' attribute in the options object:

    routing.expose_routing_table(app, { at: "/my-routes" });

Some users may want to conditionally enable it. (i.e. in development, but not in production);

# Authors
* Steven Hilton <mshiltonj@gmail.com> [@mshiltonj](http://twitter.com/mshiltonj]

# LICENSE

See [License](LICENSE)

# ChangeLog

See [Changelog](CHANGELOG)




