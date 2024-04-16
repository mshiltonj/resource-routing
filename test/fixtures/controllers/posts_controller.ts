import express from 'express'


class PostsController {
  static index(req: express.Request, res: express.Response){
    res.send("Posts Index Page")
  }
  
  static new(req: express.Request, res: express.Response){
    res.send("Posts New Page")
  }
  
  static create(req: express.Request, res: express.Response){
    res.send("Posts Create Page")
  }
  
  static show(req: express.Request, res: express.Response){
    res.send("Posts Show Page")
  }

  static edit(req: express.Request, res: express.Response){
    res.send("Posts Edit Page")
  }

  static update(req: express.Request, res: express.Response){
    res.send("Posts Update Page")
  }

  static destroy(req: express.Request, res: express.Response){
    res.send("Posts Destroy Page")
  }

  static refresh(req: express.Request, res: express.Response){
    res.send("Posts Refresh Page")
  }

  static logout(req: express.Request, res: express.Response){
    res.send("Posts Logout Page")
  }

  static multi(req: express.Request, res: express.Response){
    res.send("Posts MultiEdit Page")
  }

}


export default PostsController