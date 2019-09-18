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
    it("GET:404, responds with a custom error message when passed an invalid username", () => {
      return request(app)
        .get("/api/users/not-a-valid-username")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal("user not found");
        });
    });
  });
  describe("/articles", () => {
    describe("/:article_id", () => {
      it("GET:200, responds with an article object", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.article_id).to.equal(1);
            expect(article.title).to.equal(
              "Living in the shadow of a great man"
            );
            expect(article.topic).to.equal("mitch");
            expect(article.author).to.equal("butter_bridge");
            expect(article.body).to.equal("I find this existence challenging");
            expect(article.created_at).to.equal("2018-11-15T12:21:54.171Z");
            expect(article.votes).to.equal(100);
          });
      });
      it("GET:200, article object has a comment count property", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.comment_count).to.equal(13);
          });
      });
      it("GET:404, responds with a custom error message when passed an article_id which does not exist", () => {
        return request(app)
          .get("/api/articles/2000")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("article not found");
          });
      });
      it("PATCH:200, returns updated article with its vote property incremented by given amount", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1 })
          .expect(200)
          .then(({ body }) => {
            expect(body.article).to.deep.equal({
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              body: "I find this existence challenging",
              created_at: "2018-11-15T12:21:54.171Z",
              votes: 101
            });
          });
      });
      it("PATCH:400, responds with a custom error message when there is no inc_votes property on request body,", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              "request body must have 'inc_votes' property"
            );
          });
      });
      it("PATCH:400, responds with a custom error message when inc_votes property is of incorrect type,", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              "value of 'inc_votes' property must be a number"
            );
          });
      });
      it("PATCH:400, responds with a custom error message when there is more than one property on request body,", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1, name: "Mitch" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              "request body must have only one property"
            );
          });
      });
      describe.only("/comments", () => {
        it("POST:201, responds with posted comment", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge", body: "body" })
            .expect(201)
            .then(({ body: { comment } }) => {
              expect(comment).to.have.keys(
                "comment_id",
                "body",
                "article_id",
                "author",
                "votes",
                "created_at"
              );
              expect(comment.comment_id).to.equal(19);
              expect(comment.body).to.equal("body");
              expect(comment.article_id).to.equal(1);
              expect(comment.author).to.equal("butter_bridge");
              expect(comment.votes).to.equal(0);
            });
        });
        it("POST:400, responds with an error message when request body is not in correct format", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({})
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "null value in column violates not-null constraint"
              );
            });
        });
        it("GET:200, responds with an array of comments for the the given article id", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.an("array");
              expect(body.comments[0]).to.have.keys(
                "comment_id",
                "votes",
                "created_at",
                "author",
                "body"
              );
              expect(body.comments).to.have.length(13);
            });
        });
      });
    });
  });
});
