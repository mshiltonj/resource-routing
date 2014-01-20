# Resource Routing

Easily build routes for an express.js web app. Inspired a little by rails.

# Installation

npm install resource-routing --save

# Usage

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
    routing.resources(app, controller_dir, "users", "tables, "stories");

That's it. You now have restful routing for users, and restful routing for stories that include a user_id and a table_id param.

The resources() function takes a minimum of three paramaters:

One:   The express ap object
Two:   The app controllers directory.
Three: The entity/class/model_name that will have restful routes.

A fourth parameter, an options object, may be included, but is not yet referenced


The simplest form:

    routing.resources(app, controller_dir, "users", {}); // last param optional


Will build the 14 standard restful routes for you:

    GET     /users                    #=> UsersController.index
    GET     /users.format             #=> UsersController.index
    GET     /users/new                #=> UsersController.new
    GET     /users/new.format         #=> UsersController.new
    POST    /users                    #=> UsersController.create
    POST    /users.format             #=> UsersController.create
    GET     /users/:id                #=> UsersController.show
    GET     /users/:id.format         #=> UsersController.show
    GET     /users/:id/edit           #=> UsersController.edit
    GET     /users/:id/edit.format    #=> UsersController.edit
    PUT     /users/:id                #=> UsersController.update
    PUT     /users/:id.format         #=> UsersController.update
    DELETE  /users/:id                #=> UsersController.destroy
    DELETE  /users/:id.format         #=> UsersController.destroy

If the controller does not exist, the routes will not be created.

If a specific expected attribute on the controller do not exist or is not a function, 
the relevant route will not get created.

The functions should be defined as normal express request handlers:

    function(req, res) {};

# nested resources
Nested resources are supported. By passing more than the minimum number of paramaters, the extra
strings are assumed to be parent resources. For example, a call like:

    routing.resources(app, controller_dir, "users", "tables, "stories", {}); // again, last param optional

Resourse Routing will build the routes for stories, as a nested 
resource for tables and users, and the request will include resource
ids for the parent resourses.

These are the routes that will get created with that method call:

    GET     /users/:user_id/tables/:table_id/stories                   #=> StoriesController.index
    GET     /users/:user_id/tables/:table_id/stories.format            #=> StoriesController.index
    GET     /users/:user_id/tables/:table_id/stories/new               #=> StoriesController.new
    GET     /users/:user_id/tables/:table_id/stories/new.format        #=> StoriesController.new
    POST    /users/:user_id/tables/:table_id/stories                   #=> StoriesController.create
    POST    /users/:user_id/tables/:table_id/stories.format            #=> StoriesController.create
    GET     /users/:user_id/tables/:table_id/stories/:id               #=> StoriesController.show
    GET     /users/:user_id/tables/:table_id/stories/:id.format        #=> StoriesController.show
    GET     /users/:user_id/tables/:table_id/stories/:id/edit          #=> StoriesController.edit
    GET     /users/:user_id/tables/:table_id/stories/:id/edit.format   #=> StoriesController.edit
    PUT     /users/:user_id/tables/:table_id/stories/:id               #=> StoriesController.update
    PUT     /users/:user_id/tables/:table_id/stories/:id.format        #=> StoriesController.update
    DELETE  /users/:user_id/tables/:table_id/stories/:id               #=> StoriesController.destroy
    DELETE  /users/:user_id/tables/:table_id/stories/:id.format        #=> StoriesController.destroy

# TODO

Still a work in progress. Need to be able to: 
* declare additional custom routes.
* define namespaces
* better error checking/validation

# Authors
* Steven Hilton <mshiltonj@gmail.com> @mshiltonj

# LICENSE

MIT. see [License](LICENSE)
