process.env.NODE_ENV = "test";
const { expect } = require("chai");
const app = require("../app");
const request = require("supertest");
const connection = require("../db/connection");

describe("/api", () => {
  beforeEach(() => {
    return connection.seed.run();
  });
  after(() => connection.destroy());
  describe("/topics", () => {
    it("GET:200, responds with an array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an("array");
          expect(body.topics[0]).to.contain.keys("slug", "description");
        });
    });
  });
  describe("/users", () => {
    it("GET:200, responds with specified user object", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body }) => {
          expect(body.user).to.deep.equal({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
          });
        });
    });
    it("GET:400, responds with a custom error message when passed an invalid username", () => {
      return request(app)
        .get("/api/users/not-a-valid-username")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("invalid username");
        });
    });
  });
});
