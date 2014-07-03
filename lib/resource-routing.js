var path = require('path');
var methods = require('methods');
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
// url path to a restful resource
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

  if (! options){ options = {} };

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

// determine which of the standard routes are used by this
// resource definition.
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

function controller_action_error(controller_action, error){
  msg = "Controller action '" + controller_action +
    "' does not exist or is not a function. " +
    "Route not created."
  console.log(msg);
  if (error) { console.log(error); }
}

var handler_wrapper_default = function(handler, req, res, next){
  handler(req,res,next);
}

var handler_wrapper = handler_wrapper_default;

function set_handler_wrapper(new_handler){
  handler_wrapper = new_handler;
};

function reset_handler_wrapper(new_handler){
  handler_wrapper = handler_wrapper_default;
}

function build_route(app, method, url, controller_data, action){
  try {
    var handler = controller_data.module[action];

    if (typeof handler !== 'function'){
      controller_action_error(controller_data.file + "." + action, error);
      return;
    }

    var indirect_handler = function(req, res, next){
      handler_wrapper(handler, req, res, next);
    }


    var url_w_format = url + ".:format";

    app[method](url_w_format, indirect_handler);
    add_to_routing_table(method, url_w_format, controller_data.file, action);


    app[method](url, indirect_handler);
    add_to_routing_table(method, url, controller_data.file, action);

  } catch(error) {
    controller_action_error(controller_data.file + "." + action, error);
  }
}

function build_standard_routes(app, used_routes, controller_data, url_path, entity){
  used_routes.forEach(function(action){
    var url;
    if (! action){
      return;
    }
    var route_data = the_standard_routes[action];
    build_route(app, route_data.http_method, url_path + route_data.url_path , controller_data, action );
  });
}

function build_custom_collection_routes(app, controller_data, url_path, collection_options){
  if(! collection_options){
    return;
  }

  collection_options.forEach(function(collection_data){
    var method = collection_data[0];
    var url_part = collection_data[1];
    var action = url_part;
    if (collection_data[2]){
      action = collection_data[2];
    }
    var collection_url = url_path + "/" + url_part;
    build_route(app, method, collection_url, controller_data, action);
  });
}

function build_custom_member_routes(app, controller_data, url_path, member_options){
  if (! member_options) {
    return;
  }

  member_options.forEach(function(member_data){
    var method = member_data[0];
    var url_part = member_data[1];
    var action = url_part;
    if (member_data[2]){
      action = member_data[2];
    }

    var member_url = url_path + "/:id/" + url_part;
    build_route(app, method, member_url, controller_data, action);
  })
}

var resource_routing = function(){

  this.root = function(app, controller_dir, controller, action){
    var controller_data = get_controller(controller, controller_dir, options)

    if (! controller_data){
      console.log("entity controller for '" + controller + "' not loaded. skipping.");
      return;
    }

    build_route(app, "get", "/", controller_data, action);
    build_route(app, "get", "/index", controller_data, action);
  };

  this.resources = function(){
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
    build_custom_member_routes(app, controller_data, url_path, options.member);
    build_custom_collection_routes(app, controller_data, url_path, options.collection);

  };

  this.expose_routing_table =  function(app, options){
    var at = "/routing-table";

    if (options && options.at){
      at = options.at;
    }

    app.get(at, function(req, res){
      html = '<html>' +
        '<head>' +
        '<title>Resource Routes</title>' +
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

      html +=  '</table>' +
        '</body>' +
        '</html>';

      res.end(html);
    });

    this.set_wrapper = set_handler_wrapper;
    this.reset_wrapper = reset_handler_wrapper;

  };

  // use this for arbitrary routes, gets into the routing table.
  methods.forEach(function(method){
    this[method] = function(app, controller_dir, url, controller_action){
      var tmp = controller_action.split("#",2);
      var controller = tmp[0];
      var action     = tmp[1];

      var controller_data = get_controller(controller, controller_dir);

      if (controller_data){
        try {
          app[method](url, controller_data.module[action]);
          add_to_routing_table(method, url, controller, action);
        } catch(error) {
          controller_action_error(controller_data.file + "." + action, error);
        }
      }
    }
  })

  return this;
}();

module.exports = resource_routing;
