import express from "express";

class MembersController {
  static index(req: express.Request, res: express.Response) {
    res.send("Members Index Page");
  }

  static new(req: express.Request, res: express.Response) {
    res.send("Members New Page");
  }

  static create(req: express.Request, res: express.Response) {
    res.send("Members Create Page");
  }

  static show(req: express.Request, res: express.Response) {
    res.send("Members Show Page");
  }

  static edit(req: express.Request, res: express.Response) {
    res.send("Members Edit Page");
  }

  static update(req: express.Request, res: express.Response) {
    res.send("Members Update Page");
  }

  static destroy(req: express.Request, res: express.Response) {
    res.send("Members Destroy Page");
  }

  static refresh(req: express.Request, res: express.Response) {
    res.send("Members Refresh Page");
  }

  static logout(req: express.Request, res: express.Response) {
    res.send("Members Logout Page");
  }

  static multi(req: express.Request, res: express.Response) {
    res.send("Members MultiEdit Page");
  }
}

export default MembersController;
