import express, { Request, Response } from 'express'
import path from 'path'
import { singularize } from 'inflected'

import { HttpMethod, CustomRouteDefinition, RouteDefinition, RoutingTableEntry, EntityInfo, ResourceOptions, ControllerData, ControllerDataStrict } from "./types"

import renderRoutes from './render'

const ID_PATTERN = "\\d+|\[a-fA-F0-9\]+-\[-a-fA-F0-9\]+"

// the seven standard restful routes that get generated
const DEFAULT_RESTFUL_ROUTES : Map<string, RouteDefinition> = new Map([
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
    urlPath: `/:id(${ID_PATTERN})`
  }],
  ["edit", {
    httpMethods: ['GET'],
    urlPath: `/:id(${ID_PATTERN})/edit`
  }],
  ["update",{
    httpMethods: ['POST', 'PUT', 'PATCH'],
    urlPath: `/:id(${ID_PATTERN})`
  }],
  ["destroy", {
    httpMethods: ['DELETE'],
    urlPath: `/:id(${ID_PATTERN})`
  }]
])

class ResourceRouter {
  app: express.Application
  controllerDir: string
  extension: string
  routingTable : RoutingTableEntry[] = [];

  constructor(app: express.Application, controllerDir: string, extension: string = 'js'){
    this.app = app;
    this.controllerDir = controllerDir;
    this.extension = extension
  }

  async root(controller: string, action: string){
    const controllerData = await this.getController(controller)

    if (! controllerData){
      console.log("entity controller for '" + controller + "' not loaded. skipping.");
      return;
    }

    this.buildRoute(["GET"], "/", controllerData, action);
    this.buildRoute(["GET"], "/index", controllerData, action);
    this.buildRoute(["GET"], "/index.:format", controllerData, action);
  }

  async resources(entities: string | string[], options?: ResourceOptions){
    let entitiesArray = Array.isArray(entities) ? entities : [entities];

    let entity = entitiesArray.pop();

    if(typeof entity === 'undefined'){
      throw(new Error("no entity specified"));
    }

    let parents = entitiesArray;

    const controllerData = await this.getController(entity, options?.using)

    const parentPath = this.buildParentPath(parents);
    const entityPath = parentPath + "/" + entity;

    const urlPath = options?.prefix ? options.prefix + entityPath : entityPath;

    let usedRoutes = this.getUsedRoutes(options);

    if (options && options.memberActions){
      const memberActions : CustomRouteDefinition[] = options.memberActions ? options.memberActions : []
      this.buildCustomMemberRoutes(controllerData, urlPath, memberActions);
    }
    
    if (options && options.collectionActions){
      const collectionActions : CustomRouteDefinition[] = options.collectionActions ? options.collectionActions : []
      this.buildCustomCollectionRoutes(controllerData, urlPath, collectionActions);
    }
    this.buildStandardRoutes(usedRoutes, controllerData, urlPath);
  }

  // router.get("/login", "sessions#login")
  async get(path: string, controllerAndAction: string){
    await this._adHocRoute("GET", path, controllerAndAction);
  }

  async post(path: string, controllerAndAction: string){
    await this._adHocRoute("POST", path, controllerAndAction);
  }

  async put(path: string, controllerAndAction: string){
    await this._adHocRoute("PUT", path, controllerAndAction);
  }

  async delete(path: string, controllerAndAction: string){
    await this._adHocRoute("DELETE", path, controllerAndAction);
  }

  private async _adHocRoute(method: HttpMethod, path: string, controllerAndAction: string){
    const [controller, action] = controllerAndAction.split("#");
    const controllerData = await this.getController(controller)
    this.buildRoute([method], path, controllerData, action);
  }

  exposeRoutingTable(at? : string){
    at = at ? at : "/routingTable";

    this.app.get(`${at}`, (req : Request, res : Response) =>{
      res.end(renderRoutes(this.routingTable, req.params.format))
    })  

    this.app.get(`${at}.:format`, (req : Request, res : Response) =>{
      res.end(renderRoutes(this.routingTable, req.params.format))
    })    
  };

  private addRoutingHandler(    
    method: HttpMethod, 
    path: string, 
    handler: Function){

    // I do not know why I need to do this to satisfy the typescript compiler
    const indirectHandler = function (req: Request, res : Response, next: Function){
      return handler(req, res, next);
    }

    switch(method){
      case 'GET':
        this.app.get(path, indirectHandler);
        break;
      case 'POST':
        this.app.post(path, indirectHandler);
        break;
      case 'PUT':
        this.app.put(path, indirectHandler);
        break;
      case 'PATCH':
        this.app.patch(path, indirectHandler);
        break;
      case 'DELETE':
        this.app.delete(path, indirectHandler);
        break;
      default:
        throw(new Error("invalid method: " + method));
    }
  }

  private buildRoute(methods: HttpMethod[], url: string, controllerData : ControllerData, action: string){
    if (controllerData.module && controllerData.file){
      const controllerDataStrict = controllerData as ControllerDataStrict;    
      let handler = controllerData.module[action];

      if (typeof handler !== 'function'){
        throw new Error(controllerData.file + "." + action + " is not a function");
      }

      let urlWithFormat = url + ".:format";
      methods.forEach((method: HttpMethod) => {
        this.addRoutingHandler(method, urlWithFormat, handler)
        this.addToRoutingTable(method, urlWithFormat, controllerDataStrict.file, action);

        this.addRoutingHandler(method, url, handler)
        this.addToRoutingTable(method, url, controllerDataStrict.file, action);
      })
    }
  }

  private addToRoutingTable(method: string, url: string, file: string, action: string){
    this.routingTable.push([method, url, file, action]);
  }

  // load and return the controller module for a given resource
  // returns nil if it could not be be loaded.
  // example: file not found
  private async getController(entity: string, using?: string){
    let controllerData : ControllerData = {};  
    
    try {
      controllerData.file = (using ? using : entity) + "_controller"
      
      if (this.extension && this.extension !== ''){
        controllerData.file += "." + this.extension;
      }

      // TODO// dynamic import
      controllerData.module = (await import(path.join(this.controllerDir, controllerData.file))).default;
    } catch(error) {
      console.log(error)
      throw new Error(`${controllerData.file} could not be loaded`);
    }
    return controllerData;
  }

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
  private buildParentPath(parents: string[]){
    let parentPath = '';
  
    parents.forEach(function(item){
     parentPath += `/${item}/:${singularize(item)}Id(${ID_PATTERN})`;
    });
  
    return parentPath;
  }

  // determine which of the standard routes are used by this
  // resource definition.
  private getUsedRoutes(options: ResourceOptions | null | undefined){
    if (! options){
      options = {}
    }
  
    let actionsToUse : string[] = Array.from(DEFAULT_RESTFUL_ROUTES.keys())
  
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

  private buildStandardRoutes(usedRoutes: string[], controllerData : ControllerData, urlPath : string){
    usedRoutes.forEach((action) => {
      let url;
      if (! action){
        return;
      }
  
      let routeData : RouteDefinition | undefined = DEFAULT_RESTFUL_ROUTES.get(action);
      if (typeof routeData !== 'undefined'){
        this.buildRoute(routeData.httpMethods, urlPath + routeData.urlPath, controllerData, action );
      } else {
        throw(new Error("route data for action '" + action + "' not found."));
      }
    });
  }

  private buildCustomCollectionRoutes(controllerData: ControllerData, urlPath: string, collectionActions: CustomRouteDefinition[]){
    if(! collectionActions){
      return;
    }
  
    collectionActions.forEach((collectionData) => {
      const urlPart = collectionData.path ? collectionData.path : collectionData.action;
      let collectionUrl = urlPath + "/" + urlPart;
      this.buildRoute([collectionData.method], collectionUrl, controllerData, collectionData.action);
    });
  }
  
  private buildCustomMemberRoutes(controllerData : ControllerData, urlPath: string, memberActions: CustomRouteDefinition[]){
    if (! memberActions) {
      return;
    }
  
    memberActions.forEach((memberData) => {
      const urlPart = memberData.path ? memberData.path : memberData.action;
      let memberUrl = urlPath + `/:id(${ID_PATTERN})/` + urlPart;
      this.buildRoute([memberData.method], memberUrl, controllerData, memberData.action);
    })
  }
}

export {
  CustomRouteDefinition
}

export default ResourceRouter