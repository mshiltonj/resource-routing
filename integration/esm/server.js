import express from 'express'
import Router from 'resource-routing'
import path from 'path'

const app = express()
const controllerDir = path.resolve("./controllers")
console.log("controllerDir:", controllerDir)
const router = new Router(app, controllerDir, 'js')
router.root("index", "home")
router.resources("users")

app.listen(3000, "0.0.0.0")

