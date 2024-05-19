import { RoutingTableEntry } from "./types.js"
import Table from 'easy-table'

function stripIdPattern(urlPath: string): string {  
  return urlPath.replace(/:\w+\(.*\)/g, ':id')
}

function renderer(routingTable: RoutingTableEntry[], format?: string): string {
  format = format || 'html';

  switch (format){
    case 'html':
      return renderHtml(routingTable);
    case 'json':
      return renderJson(routingTable);
    case "txt":
      return renderText(routingTable);
    default:
      throw new Error("Unsupported format: " + format);  
  }
}

function renderHtml(routingTable: RoutingTableEntry[]): string {
  let html = '<html>' +
  '<head>' +
  '<title>Resource Routes</title>' +
  '</head>' +
  '<body>' +
  '<h1>Resource Routes</h1>' +
  '<table>' +
  '<tr>' +
  '<th>Method</th>' +
  '<th>Path</th>' +
  '<th>Handler</th>' +
  '</tr>\n';

routingTable.forEach(function(item){
  html += "<tr>\n" +
    "  <td>" +
    item[0] +
    "</td>\n" +

    "  <td>" +
    stripIdPattern(item[1]) +
    "</td>\n" +

    "  <td>" +
    item[2] + "." +
    item[3] +
    "</td>\n" +
    "</tr>\n";
  })

  html += '</table>' +
    '</body>' +
    '</html>';

  return html
}

function renderText(routingTable: RoutingTableEntry[]): string {
  const t = new Table()

  routingTable.forEach(function(route) {
    t.cell('Method', route[0])
    t.cell('Path', stripIdPattern(route[1]))
    t.cell('Handler', route[2] + "." + route[3])
    t.newRow()
  })

  return t.toString();
}

function renderJson(routingTable: RoutingTableEntry[]): string {
  const preparedRoutingTable = routingTable.map(function(route){
    return {
      method: route[0],
      path: stripIdPattern(route[1]),
      handler: route[2] + "." + route[3]
    }
  })
  return JSON.stringify(preparedRoutingTable, null, 2);
}

export default  renderer
