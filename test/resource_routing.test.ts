import Router from "../src";
import request from "supertest";
import express from "express";
import path from "path";

// TODO: test for exposing with named route

describe("Resource Router", () => {
  const controllerDir = path.resolve(__dirname, "./fixtures/controllers");
  let app: express.Application;

  test("defining root route NOPE", async () => {
    app = express();
    const router = new Router(app, controllerDir, '');
    await router.root("index", "home");
    const res = await request(app).get("/");
    // console.log(res)
    expect(res.status).toBe(200);
    expect(res.text).toBe("Home Page");
  });

  describe("defining standard routes", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users");
    });

    test("index", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Index Page");
    });

    test("index with format", async () => {
      const res = await request(app).get("/users.html");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Index Page");
    });

    test("new", async () => {
      const res = await request(app).get("/users/new");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users New Page");
    });

    test("new with format", async () => {
      const res = await request(app).get("/users/new.html");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users New Page");
    });

    test("create", async () => {
      const res = await request(app).post("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Create Page");
    });

    test("create with format", async () => {
      const res = await request(app).post("/users.html");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Create Page");
    });

    test("show", async () => {
      const res = await request(app).get("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("show with format", async () => {
      const res = await request(app).get("/users/123.html");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/users/123");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Users Update Page");

      const resPut = await request(app).put("/users/123");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Users Update Page");

      const resPatch = await request(app).patch("/users/123");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Users Update Page");
    });

    test("update with format", async () => {
      const resPost = await request(app).post("/users/123.html");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Users Update Page");

      const resPut = await request(app).put("/users/123.html");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Users Update Page");

      const resPatch = await request(app).patch("/users/123.html");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Users Update Page");
    });

    test("destroy", async () => {
      const res = await request(app).delete("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Destroy Page");
    });

    test("destroy with format", async () => {
      const res = await request(app).delete("/users/123.html");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Destroy Page");
    });
  });

  describe("defining standard routes with using", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", { using: "members" });
    });

    test("index", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Members Index Page");
    });

    test("new", async () => {
      const res = await request(app).get("/users/new");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Members New Page");
    });

    test("create", async () => {
      const res = await request(app).post("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Members Create Page");
    });

    test("show", async () => {
      const res = await request(app).get("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Members Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/users/123");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Members Update Page");

      const resPut = await request(app).put("/users/123");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Members Update Page");

      const resPatch = await request(app).patch("/users/123");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Members Update Page");
    });

    test("destroy", async () => {
      const res = await request(app).delete("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Members Destroy Page");
    });
  });

  describe("defining standard routes with prefix", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", { prefix: "/api/v1", except: ["new", "edit"]});
    });

    test("index", async () => {
      const res = await request(app).get("/api/v1/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Index Page");
    });

    test("create", async () => {
      const res = await request(app).post("/api/v1/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Create Page");
    });

    test("show with numeric id", async () => {
      const res = await request(app).get("/api/v1/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("show with hyphenated id", async () => {
      const res = await request(app).get("/api/v1/users/A1b2-C3d4");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/api/v1/users/123");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Users Update Page");

      const resPut = await request(app).put("/api/v1/users/123");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Users Update Page");

      const resPatch = await request(app).patch("/api/v1/users/123");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Users Update Page");
    });

    test("destroy", async () => {
      const res = await request(app).delete("/api/v1/users/123");
      expect(res.status).toBe(200);
    });

    test("arbitrary route not found", async () => {
      const res = await request(app).delete("/api/v1/users/junk");
      expect(res.status).toBe(404);
    });
  });

  describe("defining standard routes with except", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", { except: ["destroy"] });
    });

    test("index", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Index Page");
    });

    test("new", async () => {
      const res = await request(app).get("/users/new");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users New Page");
    });

    test("create", async () => {
      const res = await request(app).post("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Create Page");
    });

    test("show with numeric id", async () => {
      const res = await request(app).get("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("show with hyphenated id", async () => {
      const res = await request(app).get("/users/A1b2-C3d4");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/users/123");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Users Update Page");

      const resPut = await request(app).put("/users/123");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Users Update Page");

      const resPatch = await request(app).patch("/users/123");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Users Update Page");
    });

    test("destroy", async () => {
      const res = await request(app).delete("/users/123");
      expect(res.status).toBe(404);
    });

    test("arbitrary route not found", async () => {
      const res = await request(app).delete("/users/junk");
      expect(res.status).toBe(404);
    });
  });

  describe("defining standard routes with only", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", {only: ["index", "show"],});
    });

    test("index", async () => {
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Index Page");
    });

    test("new", async () => {
      const res = await request(app).get("/users/new");
      expect(res.status).toBe(404);
    });

    test("create", async () => {
      const res = await request(app).post("/users");
      expect(res.status).toBe(404);
    });

    test("show", async () => {
      const res = await request(app).get("/users/123");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/users/123");
      expect(resPost.status).toBe(404);

      const resPut = await request(app).put("/users/123");
      expect(resPut.status).toBe(404);

      const resPatch = await request(app).patch("/users/123");
      expect(resPatch.status).toBe(404);
    });

    test("destroy", async () => {
      const res = await request(app).delete("/users/123");
      expect(res.status).toBe(404);
    });
  });

  describe("defining nested routes", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources(["users", "posts"]);
    });

    test("index", async () => {
      const res = await request(app).get("/users/123/posts");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Posts Index Page");
    });

    test("new", async () => {
      const res = await request(app).get("/users/123/posts/new");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Posts New Page");
    });

    test("create", async () => {
      const res = await request(app).post("/users/123/posts");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Posts Create Page");
    });

    test("show", async () => {
      const res = await request(app).get("/users/123/posts/456");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Posts Show Page");
    });

    test("update", async () => {
      const resPost = await request(app).post("/users/123/posts/456");
      expect(resPost.status).toBe(200);
      expect(resPost.text).toBe("Posts Update Page");

      const resPut = await request(app).put("/users/123/posts/456");
      expect(resPut.status).toBe(200);
      expect(resPut.text).toBe("Posts Update Page");

      const resPatch = await request(app).patch("/users/123/posts/456");
      expect(resPatch.status).toBe(200);
      expect(resPatch.text).toBe("Posts Update Page");
    });

    test("destroy", async () => {
      const res = await request(app).delete("/users/123/posts/456");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Posts Destroy Page");
    });
  });

  describe("defining custom routes", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", {
        memberActions: [
          { method: "GET", action: "refresh" },
          { method: "POST", action: "logout" },
        ],
        collectionActions: [{ method: "POST", action: "multi" }],
      });

    });

    test("member get action", async () => {
      const res = await request(app).get("/users/1/refresh");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Refresh Page");
    });

    test("member post action", async () => {
      const res = await request(app).post("/users/1/logout");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users Logout Page");
    });

    test("collection post action", async () => {
      const res = await request(app).post("/users/multi");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Users MultiEdit Page");
    });
  });

  describe("defining route with missing controller", () => {
    test("should raise exception", async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      expect(async () => await router.resources("books")).rejects.toThrow("books_controller could not be loaded");
    });
  });

  describe("ad hoc routes", () => {
    test("should define get route", async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.get("/login", "sessions#login")
      const res = await request(app).get("/login");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Session Login Page");
    })

    test("should define post route", async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.post("/logout", "sessions#logout")
      const res = await request(app).post("/logout");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Session Logout Page");
    })
  })

  describe("defining route with missing controller action", () => {
    test("should raise exception", async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      expect(async () => await router.resources("users", { memberActions: [{method: "GET", action: "doesNotExist"}]} )).rejects.toThrow("users_controller.doesNotExist is not a function");
    });
  });

  describe("exposeRouterTable enabled", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", {
        memberActions: [
          { method: "GET", action: "refresh" },
          { method: "POST", action: "logout" },
        ],
        collectionActions: [{ method: "POST", action: "multi" }],
      });
      router.exposeRoutingTable();
    });

    test("should display defined routes in html", async () => {
      const res = await request(app).get("/routingTable.html");
      // TODO: check for defined routes
      // console.log(res.text)
      expect(res.status).toBe(200);
    })

    test("should display defined routes in text", async () => {
      const res = await request(app).get("/routingTable.txt");
      // TODO: check for defined routes
      // console.log(res.text)
      expect(res.status).toBe(200);
    })

    test("should display defined routes in json", async () => {
      const res = await request(app).get("/routingTable.json");
      // TODO: check for defined routes
      // console.log(res.text)
      expect(res.status).toBe(200);
    })

  })

  describe("exposeRouterTable enabled at custom route", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", {
        memberActions: [
          { method: "GET", action: "refresh" },
          { method: "POST", action: "logout" },
        ],
        collectionActions: [{ method: "POST", action: "multi" }],
      });
      router.exposeRoutingTable("/myRoutes");
    });

    test("should display defined routes", async () => {
      const res = await request(app).get("/myRoutes");
      // TODO: check for defined routes
      // console.log(res.text)
      expect(res.status).toBe(200);
    })
  })

  describe("exposeRouterTable not enabled", () => {
    beforeEach(async () => {
      app = express();
      const router = new Router(app, controllerDir, '');
      await router.resources("users", {
        memberActions: [
          { method: "GET", action: "refresh" },
          { method: "POST", action: "logout" },
        ],
        collectionActions: [{ method: "POST", action: "multi" }],
      });
    });

    test("should NOT display defined routes", async () => {
      const res = await request(app).get("/routingTable");
      expect(res.status).toBe(404);
    })
  })

});
