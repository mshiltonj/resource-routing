const express = require('express')
const Router = require('resource-routing').default
const path = require('path')

const app = express()
const controllerDir = path.resolve("./controllers")
const router = new Router(app, controllerDir, 'js')
router.root("index", "home")
router.resources("users")

app.listen(8888, "0.0.0.0")

