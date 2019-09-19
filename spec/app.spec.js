process.env.NODE_ENV = "test";
const chai = require("chai");
const chaiSorted = require("chai-sorted");
const chaiEach = require("chai-each");
const { expect } = chai;
chai.use(chaiSorted);
chai.use(chaiEach);
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
          expect(body.topics).to.each.contain.keys("slug", "description");
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
    it("GET:200, responds with an array of article objects", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.an("array");
          expect(body.articles).to.each.contain.keys(
            "article_id",
            "title",
            "topic",
            "author",
            "body",
            "created_at",
            "votes"
          );
        });
    });
    it("GET:200, each article object has a comment count property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.each.contain.keys("comment_count");
        });
    });
    it("GET:200, articles are sorted by 'created_at' column in descending order by default", () => {
      return request(app)
        .get("/api/articles/")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.descendingBy("created_at");
        });
    });
    it("GET:200, accepts a 'sort_by' query which sorts articles by given column name", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.descendingBy("votes");
        });
    });
    it("GET:200, accepts an 'order' query which can be set to ascending or descending", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.ascendingBy("created_at");
        });
    });
    it("GET:200, accepts 'author' query which filters articles by specified username", () => {
      return request(app)
        .get("/api/articles?author=butter_bridge")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles)
            .to.each.have.property("author")
            .equals("butter_bridge");
          expect(articles).to.have.length(3);
        });
    });
    it("GET:200, accepts 'topic' query which filters articles by specified topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles[0].topic).to.equal("mitch");
          expect(articles).to.have.length(11);
        });
    });
    it("GET:400, responds with a PSQL error message when passed an invalid 'sort_by' query", () => {
      return request(app)
        .get("/api/articles?sort_by=not-a-valid-column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("column does not exist");
        });
    });
    it("GET:400, responds with a custom error message when passed an invalid 'order' query", () => {
      return request(app)
        .get("/api/articles?order=not-a-valid-direction")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("order must be either 'asc' or 'desc'");
        });
    });
    it("GET:400, responds with an error message when passed an author which is not in database", () => {
      return request(app)
        .get("/api/articles?author=not-a-valid-author")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("bad request");
        });
    });
    it("GET:404, responds with an error message when passed an author which exists but does not have any articles associated with it", () => {
      return request(app)
        .get("/api/articles?author=lurker")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal("no articles found");
        });
    });

    describe("/:article_id", () => {
      it("GET:200, responds with an article object", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).to.contain.keys(
              "article_id",
              "title",
              "topic",
              "author",
              "body",
              "created_at",
              "votes"
            );
            expect(article.article_id).to.equal(1);
            expect(article.title).to.equal(
              "Living in the shadow of a great man"
            );
            expect(article.topic).to.equal("mitch");
            expect(article.author).to.equal("butter_bridge");
            expect(article.body).to.equal("I find this existence challenging");
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
      it("GET:404, responds with a custom error message when passed an article_id of correct type but article does not exist", () => {
        return request(app)
          .get("/api/articles/999999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("article does not exist");
          });
      });
      it("GET:400, responds with a PSQL error message when passed an article_id of incorrect type", () => {
        return request(app)
          .get("/api/articles/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("invalid input syntax for integer");
          });
      });
      it("PATCH:202, returns updated article with its vote property incremented by given amount", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1 })
          .expect(202)
          .then(({ body: { article } }) => {
            expect(article).to.have.keys(
              "article_id",
              "title",
              "topic",
              "author",
              "body",
              "created_at",
              "votes"
            );
            expect(article.article_id).to.equal(1);
            expect(article.title).to.equal(
              "Living in the shadow of a great man"
            );
            expect(article.topic).to.equal("mitch");
            expect(article.author).to.equal("butter_bridge");
            expect(article.body).to.equal("I find this existence challenging");
            expect(article.votes).to.equal(101);
          });
      });
      it("PATCH:400, responds with a custom error message when there is no inc_votes property on request body,", () => {
        // PSQL: 22P02
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
        // PSQL: 22P02
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
      describe("/comments", () => {
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
        it("POST:400, responds with a PSQL error message when request body is not in correct format", () => {
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
              expect(body.comments).to.each.have.keys(
                "comment_id",
                "body",
                "author",
                "votes",
                "created_at"
              );
              expect(body.comments).to.have.length(13);
            });
        });
        it("GET:200, comments are sorted by 'created_at' column in descending order by default", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200, accepts a 'sort_by' query which sorts comments by given column name", () => {
          return request(app)
            .get("/api/articles/1/comments?sort_by=votes")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.descendingBy("votes");
            });
        });
        it("GET:200, accepts an 'order' query which can be set to ascending or descending", () => {
          return request(app)
            .get("/api/articles/1/comments?order=asc")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.ascendingBy("created_at");
            });
        });
        it("GET:400, responds with a PSQL error message when passed an invalid 'sort_by' query", () => {
          return request(app)
            .get("/api/articles/1/comments?sort_by=not-a-valid-column")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("column does not exist");
            });
        });
        it("GET:400, responds with a custom error message when passed an invalid 'order' query", () => {
          return request(app)
            .get("/api/articles/1/comments?order=not-a-valid-direction")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("order must be either 'asc' or 'desc'");
            });
        });
      });
    });
  });
  describe("/comments", () => {
    describe("/:comment_id", () => {
      it("PATCH:202, returns updated comment with its vote property incremented by given amount", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 1 })
          .expect(202)
          .then(({ body: { comment } }) => {
            expect(comment).to.have.keys(
              "comment_id",
              "body",
              "article_id",
              "author",
              "votes",
              "created_at"
            );
            expect(comment.comment_id).to.equal(1);
            expect(comment.body).to.equal(
              "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
            );
            expect(comment.article_id).to.equal(9);
            expect(comment.author).to.equal("butter_bridge");
            expect(comment.votes).to.equal(17);
          });
      });
      it("PATCH:400, responds with a custom error message when there is no inc_votes property on request body,", () => {
        // PSQL: 22P02
        return request(app)
          .patch("/api/comments/1")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              "request body must have 'inc_votes' property"
            );
          });
      });
      it("PATCH:400, responds with a custom error message when inc_votes property is of incorrect type,", () => {
        // PSQL: 22P02
        return request(app)
          .patch("/api/comments/1")
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
          .patch("/api/comments/1")
          .send({ inc_votes: 1, name: "Mitch" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal(
              "request body must have only one property"
            );
          });
      });
      it("DELETE:204, deletes given comment", () => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204);
      });
      it("DELETE:404, responds with a custom error message when passed a comment_id of correct type but comment does not exist", () => {
        return request(app)
          .delete("/api/comments/999999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("comment does not exist");
          });
      });
      it("DELETE:400, responds with a PSQL error message when passed a comment_id of incorrect type", () => {
        return request(app)
          .delete("/api/comments/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("invalid input syntax for integer");
          });
      });
    });
  });
});
