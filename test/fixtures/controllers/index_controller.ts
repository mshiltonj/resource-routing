import express from "express";

export default {
  home: function (req: express.Request, res: express.Response) {
    res.send("Home Page");
  },
};
