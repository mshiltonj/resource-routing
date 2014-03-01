# Resource Routing

Build simple, easy restful routes for nodejs & expressjs, with a viewable routing table.

# Summary

Resource routing provides:

* a simple, easy method for generating restful routes for a model.
* a viewable routing table
* warnings if the expected controller or controller function does not exist
* ways to customize, override and extend the generated restful routes
* the same interface for creating non-restful routes, so you don't have to build routes in different ways.
* easy declaration of your "root" or "home" route.
* optional definition of a global "wrapper" function around all the routes for universal request handling setup.

# Installation

npm install resource-routing --save

# Usage

## .resources(*)
Resource Routes expects all your controllers to be in the same directory. A good recommendation is PROJECT_ROOT/controllers 
or PROJECT_ROOT/app/controllers.

Resource Routes expects all controller to be named with common convention of [entities]_controller.js,
like 'posts_controller.rb' or 'comments_controller.rb'

For example, if you have a User resource or model you want to manage. Resource Routes expects you to manage it
with a users_controller.js file. If they don't match this convention, they may not be found.

Resource Routes depends on the express.js engine.

Example usage:

    // get your app
    var express = require('express');
    var app = express();
    
    // get your controller path. NOTE: resolve to full path
    var path = require('path');
    var controller_dir = path.resolve(./controllers");
    
    // build your resource routing urls
    var routing = require('resource-routing');
    routing.resources(app, controller_dir, "users");

That's it. You now have restful routing for your User model.

The resources() function takes a minimum of three parameters:

1. The express ap object
2. The app controllers directory.
3. The entity/class/model_name, in pluralized form, that will have restful routes.


The simplest usage is:

    routing.resources(app, controller_dir, "users", {}); // last param optional


This will build the 14 standard restful routes for you:

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
    PUT     /users/:id.format         users_controller.update
    DELETE  /users/:id                users_controller.destroy
    DELETE  /users/:id.format         users_controller.destroy

If the controller does not exist, the routes will not be created.

If a specific expected attribute on the controller do not exist or is not a function,
the relevant route will not get created.

The functions should be defined as normal express request handlers:

    function(req, res) {};

A fourth parameter, an options object, may be included to add or restrict route creation.
Several option attributes are recognized:

### except

An array of standard route names. These standard routes
will be excluded from the route creation process. They will **not be created**.

Example:

    routing.resources(app, controller_use, "users", { except: ["delete"] } };

This will create six of the seven standard routes, plus their `.format` variants, but the `delete` route
will not be created.


### only
An array of standard route names. **ONLY** these standard routes
will be created. Other standard routes not included in this list will be excluded
from the route creation process.

Example:

    routing.resources(app, controller_use, "users", { only: ["index", "show"] } };

This will suppress creation of the `new`, `create`,
`update`, `edit`, and `delete` routes . In this case your user resource
will be only have read-only routes exposed.

If `only` is included in the options, the `except` option is ignored.

### member

If you need add additional custom member routes, you can declare them with the `member`
options attribute. It takes an array of arrays, where each of the sub-arrays is
two or three elements.

* The first element is the http method (get, post, put, delete)
* The second element is the url part to be appended to the entity root url
* The third element, if included, is the controller action to handle the request. If the third element
is not defined, it will look for a controller action of the same name as the url part

Example:

    routing.resources(app, controller_dir, "users", {member:[
      ["get", "foo", "bar"],
      ["get", "baz"]
    ]});

Will generate (in addition to the regular routes:

    Method  URL                       Handler
    get     /users/:id/foo            users_controller.bar
    get     /users/:id/foo.:format    users_controller.bar
    get     /users/:id/baz            users_controller.baz
    get     /users/:id/baz.:format    users_controller.baz

### collection
If you need additional custom collection routes, you can declare them with the `collection`
options attribute. It works the same way as the member attribute, but the base url used does not include :id.
Instead it uses the general controller url.

Example:

    routing.resources(app, controller_dir, "users", {collection: [
      ["get", "reset_request", "reset"]
    ]});

Will generate:

    Method    URL                           Handler
    get       /users/reset_request          users_controller.reset
    get       /users/reset_request.:format  users_controller.reset

### using:

String value. Controller file. Overrides the automatic model-to-controller
conversion (where passing in "users" will automatically try to load
"users_controller") and let's you declare which controller you will be using.

For example:

    routing.resources(app, controller_use, "users", { using: "members_controller" };

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

    routing.resources(app, controller_use, "users", { prefix: "api/1.0" };

Will create:

    Method  URL                       Handler
    get     /api/1.0/users                    members_controller.index
    get     /api/1.0/users.:format            members_controller.index
    get     /api/1.0/users/new                members_controller.new
    get     /api/1.0/users/new.:format        members_controller.new
    [etc]

### declaring nested resources
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

NOTE: None of the parent resource routes gets create. They will need their one resource call to have them defined,
like so:

    routing.resources(app, controller_dir, "users");
    routing.resources(app, controller_dir, "users", "tables");
    routing.resources(app, controller_dir, "users", "tables, "stories");


## root

Declare your root or home url with the .root() method:

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

    var tables_controller = require("./controllers/tables_controller");
    app.get("/my_tables", table_controller.index")

Do this:

    routing.get(app, controller_dir, "/my_tables", "tables#index")

It will generate the expected routes:

    Method    URL                 Handler
    get       /my_tables          tables.index
    get       /my_tables.:format  tables.index

The same restrictions for resource routes also apply here. If the controller cannot be found, the route is
not created. If the controller action is not defined or is not a function, the route is not created.

## .expose_routing_table(app, options)

If you have a lot of generated resource routes, you many want or need a convenient way to see all the routes. Resource Routing
give you a way to do this.

    var express = require('express');
    var app = express();
    var routing = require('resource-routing');
    routing.expose_routing_table(app);

This enables a display of the routing table at a default location of: `/routing-table`. This display an html table of all the
internally generated routes. It does NOT include routes not added by resource-routing.

You can override the location of the routing table by passing an 'at' attribute in the options object:

    routing.expose_routing_table(app, { at: "/my-routes" });

Some users may want to conditionally enable it. (i.e. in development, but not in production);

## .set_handler_wrapper(func)

When generating routes, Resource Routing sets up a closure for dispatching your request handlers.
The default implementation is:

    function(handler, req, res){
      handler(req, res);
    }

The `handler` here is your controller action. The default closure does anything, it just
passes the request through.

But you can override this, providing your own closure do whatever you want:

    routing.set_wrapper(function(handler, req, res){
      console.log("CUSTOM WRAPPER");
      var options = { extra_data: "example"};
      handler(req, res, options);
    })

You can define you own controller action method signature (making sure your controller actions
implement the signature), set up some global logging or metrics. It's up to you.

NOTE: Async coding practices with callback handlers make come into play here.

## .reset_handler_wrapper()

This resets the handler wrapper back to the default, non-additive closure.


# Authors
* Steven Hilton <mshiltonj@gmail.com> [@mshiltonj](http://twitter.com/mshiltonj]

# LICENSE

MIT. see [License](LICENSE)

# ChangeLog

## 0.1.0

* Add .root method to create root/home routes

## 0.0.8 

* Reorder route creation so .:format urls get hit first

## 0.0.7

* Added handler wrapper for executing custom setup code on every request.

## 0.0.6

* Fixed some documentation errors
* Added ability to declare custom resource methods via member: and collection: options on the resources() method.

## 0.0.5

* can now declare arbitrary routes via resource-routing to get all routes into the routing table

## 0.0.4

* updated README to include documetation of options.except and options.only for .resources()

## 0.0.3

* added options.using to .resources()
* added options.prefix to .resources()
* added options.at to .expose_routing_table()
* fixed nested_resources

## 0.0.2

* added routing-table html display

## 0.0.1

* Initial Release


