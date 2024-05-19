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

type RoutingTableEntry = [string, string, string, string]

type EntityInfo = {
  parents: string[],
  options: object,
  entity?: string
}

type ResourceOptions = {
  parents?: string[],
  except?: string[],
  only?: string[],
  prefix?: string,
  using?: string,
  memberActions?: CustomRouteDefinition[],
  collectionActions?: CustomRouteDefinition[]
}

type ControllerData = {
  file?: string,
  module?: any
}

type ControllerDataStrict = {
  file: string,
  module: any
}


export { HttpMethod, CustomRouteDefinition, RouteDefinition, RoutingTableEntry, EntityInfo, ResourceOptions, ControllerData, ControllerDataStrict }