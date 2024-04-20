import express from "express";

export default {
  login: function (req: express.Request, res: express.Response) {
    res.send("Session Login Page");
  },
  logout: function (req: express.Request, res: express.Response) {
    res.send("Session Logout Page");
  },
};
