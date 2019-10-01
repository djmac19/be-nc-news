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
  it("GET:200, responds with json describing all available endpoints on api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).to.be.an("object");
      });
  });
  it("INVALID METHODS:405", () => {
    const invalidMethods = ["patch", "put", "post", "delete"];
    const methodPromises = invalidMethods.map(method => {
      return request(app)
        [method]("/api")
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal("method not allowed");
        });
    });
    return Promise.all(methodPromises);
  });
  describe("/topics", () => {
    it("GET:200, responds with array of topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an("array");
          expect(body.topics).to.each.contain.keys("slug", "description");
        });
    });
    it("INVALID METHODS:405", () => {
      const invalidMethods = ["patch", "put", "post", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]("/api/topics")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
  });
  describe("/users", () => {
    describe("/:username", () => {
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
      it("GET:404, responds with custom error message when passed invalid username", () => {
        return request(app)
          .get("/api/users/not-a-valid-username")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("user not found");
          });
      });
      it("INVALID METHODS:405", () => {
        const invalidMethods = ["patch", "put", "post", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]("/api/users/butter_bridge")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
  describe("/articles", () => {
    it.only("GET:200, responds with array of article objects", () => {
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
    it.only("GET:200, each article object has 'comment_count' property which has a string value", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).to.each.contain.keys("comment_count");
          expect(articles[0].comment_count).to.equal("13");
        });
    });
    it.only("GET:200, articles are sorted by 'created_at' column in descending order by default", () => {
      return request(app)
        .get("/api/articles/")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.descendingBy("created_at");
        });
    });
    it.only("GET:200, accepts 'sort_by' query which sorts articles by given column name", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.descendingBy("votes");
        });
    });
    it.only("GET:200, accepts 'order' query which can be set to ascending or descending", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.be.ascendingBy("created_at");
        });
    });
    it.only("GET:200, accepts 'author' query which filters articles by specified username", () => {
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
    it.only("GET:200, accepts 'topic' query which filters articles by specified topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles)
            .to.each.have.property("topic")
            .equals("mitch");
          expect(articles).to.have.length(11);
        });
    });
    it.only("GET:400, responds with PSQL error message when passed invalid 'sort_by' query", () => {
      return request(app)
        .get("/api/articles?sort_by=not-a-valid-column")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("column does not exist");
        });
    }); // PSQL 42703
    it.only("GET:400, responds with custom error message when passed invalid 'order' query", () => {
      return request(app)
        .get("/api/articles?order=not-a-valid-direction")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal("order must be either 'asc' or 'desc'");
        });
    });
    it.only("GET:404, responds with custom error message when passed author which is not in database", () => {
      return request(app)
        .get("/api/articles?author=not-a-valid-author")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal("user does not exist");
        });
    });
    it.only("GET:200, responds with empty array when passed author which exists but does not have any articles associated with it", () => {
      return request(app)
        .get("/api/articles?author=lurker")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.deep.equal([]);
        });
    });
    it.only("GET:404, responds with custom error message when passed topic which is not in database", () => {
      return request(app)
        .get("/api/articles?topic=not-a-valid-topic")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal("topic does not exist");
        });
    });
    it.only("GET:200, responds with empty array when passed topic which exists but does not have any articles associated with it", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).to.deep.equal([]);
        });
    });
    it("INVALID METHODS:405", () => {
      const invalidMethods = ["patch", "put", "post", "delete"];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]("/api/articles")
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal("method not allowed");
          });
      });
      return Promise.all(methodPromises);
    });
    describe("/:article_id", () => {
      it("GET:200, responds with article object", () => {
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
      it("GET:200, article object has 'comment_count' property which has a string value", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.comment_count).to.equal("13");
          });
      });
      it("GET:404, responds with custom error message when passed article_id of correct type but article does not exist", () => {
        return request(app)
          .get("/api/articles/999999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("article does not exist");
          });
      });
      it("GET:400, responds with PSQL error message when passed article_id of incorrect type", () => {
        return request(app)
          .get("/api/articles/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL 22P02
      it("PATCH:200, returns updated article with its vote property incremented by given amount", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1 })
          .expect(200)
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
      it("PATCH:404, responds with custom error message when passed article_id of correct type but article does not exist", () => {
        return request(app)
          .patch("/api/articles/999999")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("article does not exist");
          });
      });
      it("PATCH:400, responds with PSQL error message when passed article_id of incorrect type", () => {
        return request(app)
          .patch("/api/articles/dog")
          .send({ inc_votes: 1 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL 22P02
      it("PATCH:200, ignores request and sends unchanged article to client when there is no 'inc_votes' property on request body", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({})
          .expect(200)
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
            expect(article.votes).to.equal(100);
          });
      });
      it("PATCH:400, responds with PSQL error message when inc_votes property is of incorrect type", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL: 22P02
      it("PATCH:200, ignores any additional properties on request body", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: 1, name: "Mitch" })
          .expect(200)
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
      it("INVALID METHODS:405", () => {
        const invalidMethods = ["put", "post", "delete"];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]("/api/articles/1")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
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
        it("POST:404, responds with PSQL error message when passed article_id of correct type but article does not exist", () => {
          return request(app)
            .post("/api/articles/999999/comments")
            .send({ username: "butter_bridge", body: "body" })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("article does not exist");
            });
        }); // PSQL 23503
        it("POST:400, responds with PSQL error message when passed article_id of incorrect type", () => {
          return request(app)
            .post("/api/articles/dog/comments")
            .send({ username: "butter_bridge", body: "body" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("input must be a number");
            });
        }); // PSQL 22P02
        it("POST:400, responds with custom error message when request body is missing 'username' property", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({})
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "request body must have 'username' property"
              );
            });
        });
        it("POST:400, responds with PSQL error message when request body is missing 'body' property", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge" })
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal(
                "request body missing required properties"
              );
            });
        }); // PSQL 23502
        it("POST:201, ignores any additional columns on request body", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "butter_bridge", body: "body", votes: 100 })
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
        it("POST:404, responds with custom error message when passed username which does not exist in database", () => {
          return request(app)
            .post("/api/articles/1/comments")
            .send({ username: "username", body: "body" })
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("user not found");
            });
        });
        it("GET:200, responds with array of comments for given article id", () => {
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
        it("GET:200, responds with an empty array when passed article_id which exists but article does not have any comments associated with it", () => {
          return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.an("array");
              expect(body.comments).to.have.length(0);
            });
        });
        it("GET:404, responds with custom error message when passed article_id of correct type but article does not exist", () => {
          return request(app)
            .get("/api/articles/999999/comments")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal("article does not exist");
            });
        });
        it("GET:400, responds with PSQL error message when passed article_id of incorrect type", () => {
          return request(app)
            .get("/api/articles/dog/comments")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("input must be a number");
            });
        }); // PSQL 22P02
        it("GET:200, comments are sorted by 'created_at' column in descending order by default", () => {
          return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.descendingBy("created_at");
            });
        });
        it("GET:200, accepts 'sort_by' query which sorts comments by given column name", () => {
          return request(app)
            .get("/api/articles/1/comments?sort_by=votes")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.descendingBy("votes");
            });
        });
        it("GET:200, accepts 'order' query which can be set to ascending or descending", () => {
          return request(app)
            .get("/api/articles/1/comments?order=asc")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).to.be.ascendingBy("created_at");
            });
        });
        it("GET:400, responds with PSQL error message when passed invalid 'sort_by' query", () => {
          return request(app)
            .get("/api/articles/1/comments?sort_by=not-a-valid-column")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("column does not exist");
            });
        }); // PSQL 42703
        it("GET:400, responds with custom error message when passed invalid 'order' query", () => {
          return request(app)
            .get("/api/articles/1/comments?order=not-a-valid-direction")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).to.equal("order must be either 'asc' or 'desc'");
            });
        });
        it("INVALID METHODS:405", () => {
          const invalidMethods = ["patch", "put", "delete"];
          const methodPromises = invalidMethods.map(method => {
            return request(app)
              [method]("/api/articles/1/comments")
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal("method not allowed");
              });
          });
          return Promise.all(methodPromises);
        });
      });
    });
  });
  describe("/comments", () => {
    describe("/:comment_id", () => {
      it("PATCH:200, returns updated comment with its vote property incremented by given amount", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 1 })
          .expect(200)
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
      it("PATCH:404, responds with custom error message when passed comment_id of correct type but comment does not exist", () => {
        return request(app)
          .patch("/api/comments/999999")
          .send({ inc_votes: 1 })
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("comment does not exist");
          });
      });
      it("PATCH:400, responds with PSQL error message when passed comment_id of incorrect type", () => {
        return request(app)
          .patch("/api/comments/dog")
          .send({ inc_votes: 1 })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL 22P02
      it("PATCH:200, ignores request and sends unchanged comment to client when there is no 'inc_votes' property on request body", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({})
          .expect(200)
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
            expect(comment.votes).to.equal(16);
          });
      });
      it("PATCH:400, responds with PSQL error message when inc_votes property is of incorrect type,", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL: 22P02
      it("PATCH:200, ignores any additional properties on request body,", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 1, name: "Mitch" })
          .expect(200)
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
      it("DELETE:204, deletes given comment", () => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204);
      });
      it("DELETE:404, responds with custom error message when passed comment_id of correct type but comment does not exist", () => {
        return request(app)
          .delete("/api/comments/999999")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal("comment does not exist");
          });
      });
      it("DELETE:400, responds with PSQL error message when passed comment_id of incorrect type", () => {
        return request(app)
          .delete("/api/comments/dog")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal("input must be a number");
          });
      }); // PSQL 22P02
      it("INVALID METHODS:405", () => {
        const invalidMethods = ["get", "put", "post"];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]("/api/comments/1")
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal("method not allowed");
            });
        });
        return Promise.all(methodPromises);
      });
    });
  });
});
