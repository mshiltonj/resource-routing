var path = require('path');
require('inflector');

// the seven standard restful routes that get generated
var the_standard_routes = {
  index: {
    http_method: 'get',
    url_path: ''
  },
  new: {
    http_method: 'get',
    url_path: '/new'
  },
  create: {
    http_method: 'post',
    url_path: ''
  },
  show: {
    http_method: 'get',
    url_path: '/:id'
  },
  edit: {
    http_method: 'get',
    url_path: '/:id/edit'
  },
  update:{
    http_method: 'get',
    url_path: '/:id'
  },
  destroy: {
    http_method: 'delete',
    url_path: '/:id'
  }
};

var routing_table = [];

// builds a string to be used a path prefix for a
// url path to a restul resource
// that includes parent resources.
//
// * parents should be an array of strings
// Example:
//     parent = ["users", "tables"];
//     parent_path = build_parent_path(parents);
//
//     parent_path === "/users/:user_id/tables/:table_id"
//
function build_parent_path(parents){
  var parent_path = '';

  parents.forEach(function(item){
   parent_path += "/" + item + "/:" + item.singular() + "_id";
  });

  return parent_path;
}

// gets the parents, the entity, and the options
function get_args(args){
  var entity_info = { parents: [], options: {} };

  // last element may be an options hash
  if ( typeof args[args.length -1] === 'object'){
    entity_info.options = args.pop();
  }

  entity_info.entity = args.pop();

  entity_info.parents = args.map(function(item){
      return item;
  });

  return entity_info;
}

// load and return the controller module for a given resource
// returns nil if it could not be be loaded.
// example: file not found
function get_controller(entity, controller_dir,  options){
  var controller_data = {};
  var file;
  try {

    if (options.using){
      file = options.using;
      controller_data.file = options.using;
    }
    else {
      file = entity + "_controller"
      controller_data.file = file;
    }
      controller_data.module = require(path.join(controller_dir, controller_data.file));
  } catch(error) {
    console.log(file + " could not be loaded: " + error);
    return;
  }
  return controller_data;
}


function get_used_routes(options){

  var used_routes = Object.getOwnPropertyNames(the_standard_routes);

  if (options.only){
    used_routes = used_routes.map(function(routeName){
      if (options.only.indexOf(routeName) !== -1){
        return routeName;
      }
    });
  } else if(options.exclude) {
    used_routes = used_routes.map(function(routeName){
      if (options.exclude.indexOf(routeName) === -1){
        return routeName;
      }
    });
  }

  return used_routes;
}

function add_to_routing_table(method, url, file, action){
  routing_table.push([method, url, file, action]);
}

function expose_routing_table(app){
  app.get("/routing-table", function(req, res){
    html = '<html>' +
      '<head>' +
      '</head>' +
      '<body>' +
      '<h1>Resource Routes</h1>' +
      '<table>' +
      '<tr>' +
      '<th>Method</th>' +
      '<th>URL</th>' +
      '<th>Handler</th>' +
      '</tr>';

    routing_table.forEach(function(item){
      html += "<tr>" +
        "<td>" +
        item[0] +
        "</td>" +

        "<td>" +
        item[1] +
        "</td>" +

        "<td>" +
        item[2] + "." +
        item[3] +
        "</td>" +
        "</tr>";
    })

    html +=  '</table>'
      '</body>' +
      '</html>';

    res.end(html);
  });

}

function build_standard_routes(app, used_routes, controller_data, url_path, entity){
  used_routes.forEach(function(action){
    var url;
    if (! action){
      return;
    }
    try {
      route_data = the_standard_routes[action];
      url = url_path + route_data.url_path;

      app[route_data.http_method](url, controller_data.module[action]);
      add_to_routing_table(route_data.http_method, url, controller_data.file, action);

      url +=  ".:format";
      app[route_data.http_method](url, controller_data.module[action]);
      add_to_routing_table(route_data.http_method, url, controller_data.file, action);

    } catch(error){
      console.log("Could not build route for '" + entity + "' " + action);
      console.log(error);
    }
  });
}

// Build the resource routes
// params:
// 1: express app
// 2: controller_dir (full path string)
// 3-n: resources, all but the last will be parent resources
//
// n + 1: options object (optional)
//
// Recognized options are:
// * except
//    An array of standard route names. These standard routes
//    will not be created. For example, passing ['destroy']
//    will create 6 of the seven standard routes, but users
//    will not be able to delete a resource.
//
// * only
//    An array of standard route names. ONLY these standard routes
//    will be created. For example, passing ['index', 'show']
//    as the 'only' option, will supress creation of new, create,
//    update, edit, and delete. In this case your resource
//    will be only have read-only routes exposed.
//
//    If only is included in the options, the except option is
//    ignored.
//
// * using
//    declare an explicit controller to be used for the route
//    handling, instead of the inferred users -> users_controller
//
// * member // NOT YET IMPLEMENTED
//    object hash of additional, custom member routes. More on this later.
//
// * collection // NOT YET IMPLEMENTED
//    object hash of additional, custom collection routes. More on this later.

var resources = function(){
  var args = Array.prototype.slice.call(arguments);

  var app             = args.shift();
  var controller_dir  = args.shift();
  var args_info       = get_args(args);

  var options         = args_info.options;
  var parents         = args_info.parents;
  var entity          = args_info.entity;

  var entity_controller;
  var url_path;
  var parent_path;
  var prefix;

  var controller_data = get_controller(entity, controller_dir, options)

  if (! controller_data){
    console.log("entity controller for '" + entity + "' not loaded. skipping.");
    return;
  }

  parent_path = build_parent_path(parents);
  url_path = parent_path + "/" + entity;

  if (options.prefix){
    prefix = options.prefix;

    if(prefix.indexOf("/") !== 0){
      prefix = "/" + prefix;
    }

    url_path = prefix + url_path;
  }

  var used_routes = get_used_routes(options);

  build_standard_routes(app, used_routes, controller_data, url_path, entity);

  // TODO: TO BE IMPLEMENTED
  //build_custom_member_routes(app, entity_controller, parents, entity, options.member);
  //build_custom_collection_routes(app, entity_controller, parents, entity, options.collection);

};

module.exports = {
  resources: resources,
  expose_routing_table: expose_routing_table
};
