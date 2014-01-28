# Resource Routing

Easily build routes for an express.js web app. Inspired a little by rails.

# Installation

npm install resource-routing --save

# Usage

## .resources(*)
Resource Routes expects all your controllers to be in the same directory. A good recommendation is PROJECT_ROOT/controllers 
or PROJECT_ROOT/app/controllers.

Resource Routes expects all and to be named like foos_controller.js
For example, if you have a User resource or model you want to manage. Resource Routes expects you to manage it
with a users_controller.js file. If they don't match this convetion, they may not be found.

Requires express:

    // get your app
    var express = require('express');
    var app = express();
    
    // get your controller path. NOTE: resolve to full path
    var path = require('path');
    var controller_dir = path.resolve(./controllers");
    
    // build your resource routing urls
    var routing = require('resource-routing');
    routing.resources(app, controller_dir, "users");
    routing.resources(app, controller_dir, "users", "tables", "stories");

That's it. You now have restful routing for users, and restful routing for stories that include a user_id and a table_id param.

The resources() function takes a minimum of three paramaters:

One:   The express ap object
Two:   The app controllers directory.
Three: The entity/class/model_name that will have restful routes.


The simplest usage is:

    routing.resources(app, controller_dir, "users", {}); // last param optional


Will build the 14 standard restful routes for you:

    Method  URL                       Handler
    GET     /users                    UsersController.index
    GET     /users.format             UsersController.index
    GET     /users/new                UsersController.new
    GET     /users/new.format         UsersController.new
    POST    /users                    UsersController.create
    POST    /users.format             UsersController.create
    GET     /users/:id                UsersController.show
    GET     /users/:id.format         UsersController.show
    GET     /users/:id/edit           UsersController.edit
    GET     /users/:id/edit.format    UsersController.edit
    PUT     /users/:id                UsersController.update
    PUT     /users/:id.format         UsersController.update
    DELETE  /users/:id                UsersController.destroy
    DELETE  /users/:id.format         UsersController.destroy

If the controller does not exist, the routes will not be created.

If a specific expected attribute on the controller do not exist or is not a function,
the relevant route will not get created.

The functions should be defined as normal express request handlers:

    function(req, res) {};

A fourth parameter, an options object, may be included. Several option attributes are recognized:


### except

An array of standard route names. These standard routes
will not be created.

Example:

    routing.resoures(app, controller_use, "users", { except: ["delete"] } };

This will create six of the seven standard routes, but users
will not be able to delete a resource.


### only
An array of standard route names. ONLY these standard routes
will be created.

Example:

    routing.resoures(app, controller_use, "users", { only: ["index", "create"] } };

This will suppress creation of the `new`, `create`,
`update`, `edit`, and `delete` routes . In this case your resource
will be only have read-only routes exposed.

If `only` is included in the options, the `except` option is ignored.

### using:

String value. Controller file. Overrides the automatic model-to-controller
conversion (where passing in "users" will automatically try to load
"users_controller") and let's you declare which controller you will be using.

For example:

    routing.resoures(app, controller_use, "users", { using: "members_controller" };

Will create:

    Method  URL                       Handler
    get     /users                    members_controller.index
    get     /users.:format            members_controller.index
    get     /users/new                members_controller.new
    get     /users/new.:format        members_controller.new
    [etc]


### prefix:

String value. Url prefix. If defined, it is prepended to the generated url path. Useful
for namespaces or url versioning:

For example:

    routing.resoures(app, controller_use, "users", { prefix: "api/1.0" };

Will create:

    Method  URL                       Handler
    get     /api/1.0/users                    members_controller.index
    get     /api/1.0/users.:format            members_controller.index
    get     /api/1.0/users/new                members_controller.new
    get     /api/1.0/users/new.:format        members_controller.new
    [etc]

### nested resources
Nested resources are supported. By passing more than the minimum number of paramaters, the extra
strings are assumed to be parent resources. For example, a call like:

    routing.resources(app, controller_dir, "users", "tables, "stories", {}); // again, last param optional

Resource Routing will build the routes for stories, as a nested
resource for tables and users, and the request will include resource
ids for the parent resourses.

These are the routes that will get created with that method call:

    Method  URL                                                        Handler
    GET     /users/:user_id/tables/:table_id/stories                   StoriesController.index
    GET     /users/:user_id/tables/:table_id/stories.format            StoriesController.index
    GET     /users/:user_id/tables/:table_id/stories/new               StoriesController.new
    GET     /users/:user_id/tables/:table_id/stories/new.format        StoriesController.new
    POST    /users/:user_id/tables/:table_id/stories                   StoriesController.create
    POST    /users/:user_id/tables/:table_id/stories.format            StoriesController.create
    GET     /users/:user_id/tables/:table_id/stories/:id               StoriesController.show
    GET     /users/:user_id/tables/:table_id/stories/:id.format        StoriesController.show
    GET     /users/:user_id/tables/:table_id/stories/:id/edit          StoriesController.edit
    GET     /users/:user_id/tables/:table_id/stories/:id/edit.format   StoriesController.edit
    PUT     /users/:user_id/tables/:table_id/stories/:id               StoriesController.update
    PUT     /users/:user_id/tables/:table_id/stories/:id.format        StoriesController.update
    DELETE  /users/:user_id/tables/:table_id/stories/:id               StoriesController.destroy
    DELETE  /users/:user_id/tables/:table_id/stories/:id.format        StoriesController.destroy

## .expose_routing_table(app, options)

If you have a lot of generated resource routes, you many want a handy way to see all the routes. Resource Routing
give you a way to do this.

    var express = require('express');
    var app = express();
    var routing = require('resource-routing');
    routing.expose_routing_table(app);

This enables a route handler a default route of: `/routing-table` that will display an html table of all the
internally generated routes. It does NOT include routes not added by resource-routing.

You can override the location of the routing table by passing an 'at' attribute in the options object:

    routing.expose_routing_table(app, { at: "/my-routes" });

Some users may want to conditionally enable it. (i.e. In development, but not in production);

## Arbitrary routes (get, post, put, delete):

You can declare all you routes through resource-routing, not just resources or restful routes.
Resource routing provides a light wrapper around the traditional route express.js declaration.

There are two reasons to do this:

1. Consistency in declaring routes in your applications.
1. Arbitrary routes declared through resource-routing are added to the routing table.

Example:

      routing.get(app, controller_dir, "/my_tables", "tables#index")

Will generate:

    Method    URL         Handler
    get       /my_tables  tables.index

The same restrictions for resource routes also apply here. If the controller cannot be found, the route is
not created. If the controller action is not defined or is not a function, the route is not created.


# TODO

Still a work in progress. Need to be able to:

* declare additional custom routes.
* better error checking/validation

# Authors
* Steven Hilton <mshiltonj@gmail.com> [@mshiltonj](http://twitter.com/mshiltonj]

# LICENSE

MIT. see [License](LICENSE)


# ChangeLog

## 0.0.1
* Initial Release

## 0.0.2
* added routing-table html display

## 0.0.3

* added options.using to .resources()
* added options.prefix to .resources()
* added options.at to .expose_routing_table()
* fixed nested_resources

## 0.0.4

* updated README to include documetation of options.except and options.only for .resources()

## 0.0.5

* can now declare arbitrary routes via resource-routing to get all routes into the routing table
