import express, { Request, Response } from 'express'
import path from 'path'
import { singularize } from 'inflected'

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type CustomRouteDefinition = {
   method: HttpMethod,
   action: string,
   path?: string
}

type RouteDefinition = {
  httpMethods: HttpMethod[],
  urlPath: string
}


const idPattern = "\\d+|\[a-fA-F0-9\]+-\[-a-fA-F0-9\]+"
// the seven standard restful routes that get generated
const standardRoutes : Map<string, RouteDefinition> = new Map([
  [ "index", {
    httpMethods: ['GET'],
    urlPath: ''
  }],
  ["new", {
    httpMethods: ['GET'],
    urlPath: '/new'
  }],
  ["create", {
    httpMethods: ['POST'],
    urlPath: ''
  }],
  ["show", {
    httpMethods: ['GET'],
    urlPath: `/:id(${idPattern})`
  }],
  ["edit", {
    httpMethods: ['GET'],
    urlPath: `/:id(${idPattern})/edit`
  }],
  ["update",{
    httpMethods: ['POST', 'PUT', 'PATCH'],
    urlPath: `/:id(${idPattern})`
  }],
  ["destroy", {
    httpMethods: ['DELETE'],
    urlPath: `/:id(${idPattern})`
  }]
])

type RoutingTableEntry = [string, string, string, string]

let routingTable : RoutingTableEntry[] = [];

// builds a string to be used a path prefix for a
// url path to a restful resource
// that includes parent resources.
//
// * parents should be an array of strings
// Example:
//     parent = ["users", "tables"];
//     parentPath = buildParentPath(parents);
//
//     parentPath === "/users/:userId/tables/:tableId"
//
function buildParentPath(parents: string[]){
  let parentPath = '';

  parents.forEach(function(item){
   parentPath += `/${item}/:${singularize(item)}Id(${idPattern})`;
  });

  return parentPath;
}

type EntityInfo = {
  parents: string[],
  options: object,
  entity?: string
}

type ResourceOptions = {
  parents?: string[],
  options?: ControllerOptions,
  except?: string[],
  only?: string[],
  prefix?: string,
  using?: string,
  memberActions?: CustomRouteDefinition[],
  collectionActions?: CustomRouteDefinition[]
}

type ControllerOptions = {
  using?: string,
}

type ControllerData = {
  file?: string,
  module?: any
}

type ControllerDataStrict = {
  file: string,
  module: any
}

// load and return the controller module for a given resource
// returns nil if it could not be be loaded.
// example: file not found
function getController(entity: string, controllerDir: string, options?: ControllerOptions){
  let controllerData : ControllerData = {};  
  
  if (! options){ options = {} };

  try {
    if (options.using){
      controllerData.file = options.using;
    }
    else {
      controllerData.file = entity + "_controller"
    }
      controllerData.module = require(path.join(controllerDir, controllerData.file)).default;
  } catch(error) {
    console.log(controllerData.file + " could not be loaded: " + error);
    process.exit(1);
  }
  return controllerData;
}

// determine which of the standard routes are used by this
// resource definition.
function getUsedRoutes(options: ResourceOptions | null | undefined){
  if (! options){
    options = {}
  }

  let actionsToUse : string[] = Array.from(standardRoutes.keys())


  if (options.only){
    actionsToUse = actionsToUse.filter(function(action){
      if (! options.only){
        return true;
      }
      return options.only.indexOf(action) >= 0;
    })
  } else if(options.except) {
    actionsToUse = actionsToUse.filter(function(action){
      if (! options.except){
        return false;
      }
      return options.except.indexOf(action) == -1;
    })
  }

  return actionsToUse;
}

function addToRoutingTable(method: string, url: string, file: string, action: string){
  routingTable.push([method, url, file, action]);
}

function controllerActionError(controllerAction: string, error: Error | null){
  const msg = "Controller action '" + controllerAction +
    "' does not exist or is not a function. " +
    "Route not created."
  console.log(msg);
  if (error) { console.log(error); }
}

const handlerWrapper = function(handler : Function, req : Request, res: Response, next: Function){
  handler(req,res,next);
}

function buildRoute(app: express.Application, methods: HttpMethod[], url: string, controllerData : ControllerData, action: string){
  try {

    if (controllerData.module && controllerData.file){
      const controllerDataStrict = controllerData as ControllerDataStrict;    
      let handler = controllerData.module[action];

      if (typeof handler !== 'function'){
        controllerActionError(controllerData.file + "." + action, new Error("handler is undefined"));
        process.exit(1);
      }

      let urlWithFormat = url + ".:format";

      methods.forEach(function(method: HttpMethod){
        
        addRoutingHandler(app, method, urlWithFormat, handler)
        addToRoutingTable(method, urlWithFormat, controllerDataStrict.file, action);

        addRoutingHandler(app, method, url, handler)
        addToRoutingTable(method, url, controllerDataStrict.file, action);
      })
    }
  } catch(error) {
    if (error instanceof Error){
      controllerActionError(controllerData.file + "." + action, error);
    }
  }
}


function addRoutingHandler(
    app: express.Application, 
    method: HttpMethod, 
    path: string, 
    handler: Function){


  let indirectHandler = function(req: Request, res : Response, next: Function){
    handlerWrapper(handler, req, res, next);
  }
    
  switch(method){
    case 'GET':
      app.get(path, indirectHandler);
      break;
    case 'POST':
      app.post(path, indirectHandler);
      break;
    case 'PUT':
      app.put(path, indirectHandler);
      break;
    case 'PATCH':
      app.patch(path, indirectHandler);
      break;
    case 'DELETE':
      app.delete(path, indirectHandler);
      break;
    default:
      throw(new Error("invalid method: " + method));
  }

}


function buildStandardRoutes(app : express.Application, usedRoutes: string[], controllerData : ControllerData, urlPath : string){
  usedRoutes.forEach(function(action){
    let url;
    if (! action){
      return;
    }

    let routeData : RouteDefinition | undefined = standardRoutes.get(action);
    if (typeof routeData !== 'undefined'){
      buildRoute(app, routeData.httpMethods, urlPath + routeData.urlPath, controllerData, action );
    } else {
      throw(new Error("route data for action '" + action + "' not found."));
    }
  });
}

function buildCustomCollectionRoutes(app: express.Application, controllerData: ControllerData, urlPath: string, collectionActions: CustomRouteDefinition[]){
  if(! collectionActions){
    return;
  }

  collectionActions.forEach(function(collectionData){
    const urlPart = collectionData.path ? collectionData.path : collectionData.action;
    let collectionUrl = urlPath + "/" + urlPart;
    buildRoute(app, [collectionData.method], collectionUrl, controllerData, collectionData.action);
  });
}

function buildCustomMemberRoutes(app: express.Application, controllerData : ControllerData, urlPath: string, memberActions: CustomRouteDefinition[]){
  if (! memberActions) {
    return;
  }

  memberActions.forEach(function(memberData){
    const urlPart = memberData.path ? memberData.path : memberData.action;
    let memberUrl = urlPath + "/:id/" + urlPart;
    buildRoute(app, [memberData.method], memberUrl, controllerData, memberData.action);
  })
}

class ResourceRouter {
  static root = function(app: express.Application, controllerDir: string, controller: string, action: string){
    const options = {}
    const controllerData = getController(controller, controllerDir, options)

    if (! controllerData){
      console.log("entity controller for '" + controller + "' not loaded. skipping.");
      return;
    }

    buildRoute(app, ["GET"], "/", controllerData, action);
    buildRoute(app, ["GET"], "/index", controllerData, action);
  }

  // TODO: add support for 'prefix' option
  // TODO: add support for 'using' option
  static resources = function(app : express.Application, controllerDir: string, entities: string | string[], options?: ResourceOptions){
    let entitiesArray = Array.isArray(entities) ? entities : [entities];

    let entity = entitiesArray.pop();

    if(typeof entity === 'undefined'){
      throw(new Error("no entity specified"));
    }

    let parents = entitiesArray;

    const controllerOptions = options ? options.options : undefined
    const controllerData = getController(entity, controllerDir, controllerOptions)

    const parentPath = buildParentPath(parents);
    const urlPath = parentPath + "/" + entity;

    let usedRoutes = getUsedRoutes(options);

    if (options && options.memberActions){
      const memberActions : CustomRouteDefinition[] = options.memberActions ? options.memberActions : []
      buildCustomMemberRoutes(app, controllerData, urlPath, memberActions);
    }
    
    if (options && options.collectionActions){
      const collectionActions : CustomRouteDefinition[] = options.collectionActions ? options.collectionActions : []
      buildCustomCollectionRoutes(app, controllerData, urlPath, collectionActions);
    }

    buildStandardRoutes(app, usedRoutes, controllerData, urlPath);
  }

  static resetRoutingTable = function(){
    routingTable = [];
  }

  static exposeRoutingTable = function(app: express.Application, options? : any ){
    let at = "/routing-table";

    if (options && options.at){
      at = options.at;
    }

    app.get(at, function(_req : Request, res : Response){
      let html = '<html>' +
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
        '</tr>\n';

      routingTable.forEach(function(item){
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
          "</tr>\n";
      })

      html += '</table>' +
        '</body>' +
        '</html>';
      res.end(html);
    })
  };
}

export default ResourceRouter

export {
  CustomRouteDefinition
}
