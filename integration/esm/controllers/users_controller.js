import express from "express";

class UsersController {
  static index(req, res) {
    res.send("Users Index Page");
  }

  static new(req, res) {
    res.send("Users New Page");
  }

  static create(req, res) {
    res.send("Users Create Page");
  }

  static show(req, res) {
    res.send("Users Show Page");
  }

  static edit(req, res) {
    res.send("Users Edit Page");
  }

  static update(req, res) {
    res.send("Users Update Page");
  }

  static destroy(req, res) {
    res.send("Users Destroy Page");
  }

  static refresh(req, res) {
    res.send("Users Refresh Page");
  }

  static logout(req, res) {
    res.send("Users Logout Page");
  }

  static multi(req, res) {
    res.send("Users MultiEdit Page");
  }
}

export default UsersController;
