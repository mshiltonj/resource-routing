import express from 'express'


class UsersController {
  static index(req: express.Request, res: express.Response){
    res.send("Users Index Page")
  }
  
  static new(req: express.Request, res: express.Response){
    res.send("Users New Page")
  }
  
  static create(req: express.Request, res: express.Response){
    res.send("Users Create Page")
  }
  
  static show(req: express.Request, res: express.Response){
    res.send("Users Show Page")
  }

  static edit(req: express.Request, res: express.Response){
    res.send("Users Edit Page")
  }

  static update(req: express.Request, res: express.Response){
    res.send("Users Update Page")
  }

  static destroy(req: express.Request, res: express.Response){
    res.send("Users Destroy Page")
  }

  static refresh(req: express.Request, res: express.Response){
    res.send("Users Refresh Page")
  }

  static logout(req: express.Request, res: express.Response){
    res.send("Users Logout Page")
  }

  static multi(req: express.Request, res: express.Response){
    res.send("Users MultiEdit Page")
  }

}


export default UsersController