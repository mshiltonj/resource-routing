import routing from '../src/';
import request from 'supertest';
import express from 'express';
import path from 'path';

describe("Resource Routing", () => {
  const controllerDir = path.resolve(__dirname, './fixtures/controllers'); 
  let app : express.Application;

  test("defining root route", async () => {
    app = express();
    routing.root(app, controllerDir, "index", "home");
    const res = await request(app).get("/")
    // console.log(res)
    expect(res.status).toBe(200)
    expect(res.text).toBe("Home Page")
  });

  describe("defining standard routes", () => {
    beforeEach(() => {
      app = express();
      routing.resources(app, controllerDir, "users");
    });

    afterEach(() => {
      routing.resetRoutingTable();
    })

    test("index", async () => {
      const res = await request(app).get("/users")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Index Page")
    })

    test("new", async () => {
      const res = await request(app).get("/users/new")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users New Page")
    })

    test("create", async () => {
      const res = await request(app).post("/users")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Create Page")
    })

    test("show", async () => {
      const res = await request(app).get("/users/123")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Show Page")
    })

    test("update", async () => {
      const resPost = await request(app).post("/users/123")
      expect(resPost.status).toBe(200)
      expect(resPost.text).toBe("Users Update Page")

      const resPut = await request(app).put("/users/123")
      expect(resPut.status).toBe(200)
      expect(resPut.text).toBe("Users Update Page")

      const resPatch = await request(app).patch("/users/123")
      expect(resPatch.status).toBe(200)
      expect(resPatch.text).toBe("Users Update Page")
    })

    test("destroy", async () => {
      const res = await request(app).delete("/users/123")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Destroy Page")
    })
  })

  describe("defining standard routes with except", () => {
    beforeEach(() => {
      app = express();
      routing.resources(app, controllerDir, "users", { except: ["destroy"] });
    });

    afterEach(() => {
      routing.resetRoutingTable();
    })

    test("index", async () => {
      const res = await request(app).get("/users")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Index Page")
    })

    test("new", async () => {
      const res = await request(app).get("/users/new")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users New Page")
    })

    test("create", async () => {
      const res = await request(app).post("/users")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Create Page")
    })

    test("show with numeric id", async () => {
      const res = await request(app).get("/users/123")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Show Page")
    })

    test("show with hyphenated id", async () => {
      const res = await request(app).get("/users/A1b2-C3d4")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Show Page")
    })

    test("update", async () => {
      const resPost = await request(app).post("/users/123")
      expect(resPost.status).toBe(200)
      expect(resPost.text).toBe("Users Update Page")

      const resPut = await request(app).put("/users/123")
      expect(resPut.status).toBe(200)
      expect(resPut.text).toBe("Users Update Page")

      const resPatch = await request(app).patch("/users/123")
      expect(resPatch.status).toBe(200)
      expect(resPatch.text).toBe("Users Update Page")
    })

    test("destroy", async () => {
      const res = await request(app).delete("/users/123")
      expect(res.status).toBe(404)
    })

    test("arbitrary route not found", async () => {
      const res = await request(app).delete("/users/junk")
      expect(res.status).toBe(404)
    })
  })

  describe("defining standard routes with only", () => {
    beforeEach(() => {
      app = express();
      routing.resources(app, controllerDir, "users", { only: ["index", "show"] });
    });

    afterEach(() => {
      routing.resetRoutingTable();
    })

    test("index", async () => {
      const res = await request(app).get("/users")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Index Page")
    })

    test("new NOPE", async () => {
      const res = await request(app).get("/users/new")
      expect(res.status).toBe(404)
    })

    test("create", async () => {
      const res = await request(app).post("/users")
      expect(res.status).toBe(404)
    })

    test("show", async () => {
      const res = await request(app).get("/users/123")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Show Page")
    })

    test("update", async () => {
      const resPost = await request(app).post("/users/123")
      expect(resPost.status).toBe(404)

      const resPut = await request(app).put("/users/123")
      expect(resPut.status).toBe(404)

      const resPatch = await request(app).patch("/users/123")
      expect(resPatch.status).toBe(404)
    })

    test("destroy", async () => {
      const res = await request(app).delete("/users/123")
      expect(res.status).toBe(404)
    })
  })

  describe("defining nested routes", () => {
    beforeEach(() => {
      app = express();
      routing.resources(app, controllerDir, ["users", "posts"]);
    });

    afterEach(() => {
      routing.resetRoutingTable();
    })

    test("index", async () => {
      const res = await request(app).get("/users/123/posts")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Posts Index Page")
    })

    test("new", async () => {
      const res = await request(app).get("/users/123/posts/new")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Posts New Page")
    })

    test("create", async () => {
      const res = await request(app).post("/users/123/posts")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Posts Create Page")
    })

    test("show", async () => {
      const res = await request(app).get("/users/123/posts/456")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Posts Show Page")
    })

    test("update", async () => {
      const resPost = await request(app).post("/users/123/posts/456")
      expect(resPost.status).toBe(200)
      expect(resPost.text).toBe("Posts Update Page")

      const resPut = await request(app).put("/users/123/posts/456")
      expect(resPut.status).toBe(200)
      expect(resPut.text).toBe("Posts Update Page")

      const resPatch = await request(app).patch("/users/123/posts/456")
      expect(resPatch.status).toBe(200)
      expect(resPatch.text).toBe("Posts Update Page")
    })

    test("destroy", async () => {
      const res = await request(app).delete("/users/123/posts/456")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Posts Destroy Page")
    })
  });
  
  describe("defining custom routes", () => {
    beforeEach(async () => {
      app = express();
      routing.resources(app, controllerDir, "users", { 
        memberActions: [
          { method: "GET", action: "refresh"},
          { method: "POST", action: "logout"}
        ], 
        collectionActions: [
          { method: "POST", action: "multi"}
        ]
      });

      routing.exposeRoutingTable(app);
      const resRoutes = await request(app).get("/routing-table")
      // console.log(resRoutes.text)
    });


    test("member get action", async () => {
      const res = await request(app).get("/users/1/refresh")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Refresh Page")
    })

    test("member post action", async () => {
      const res = await request(app).post("/users/1/logout")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users Logout Page")
    })

    test("collection post action", async () => {
      const res = await request(app).post("/users/multi")
      expect(res.status).toBe(200)
      expect(res.text).toBe("Users MultiEdit Page")
    })

  })

});