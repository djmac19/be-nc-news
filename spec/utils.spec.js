const { expect } = require("chai");
const {
  formatDates,
  makeRefObj,
  formatComments
} = require("../db/utils/utils");

describe("formatDates", () => {
  it("given an empty array, returns an empty array", () => {
    const input = [];
    const actualResult = formatDates(input);
    const expectedResult = [];
    expect(actualResult).to.deep.equal(expectedResult);
  });
  it("does not mutate original input", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const actualResult = formatDates(input);
    expect(input).to.deep.equal([
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ]);
  });
  it("given an array containing only one object, converts timestamp into javascript date object", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const actualResult = formatDates(input);
    const expectedResult = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: new Date(1542284514171),
        votes: 100
      }
    ];
    expect(actualResult).to.deep.equal(expectedResult);
  });
  it("given an array containing multiple objects, converts all timestamps into javascript date objects", () => {
    const input = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      },
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      }
    ];
    const actualResult = formatDates(input);
    const expectedResult = [
      {
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: new Date(1542284514171),
        votes: 100
      },
      {
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: new Date(1289996514171)
      }
    ];
    expect(actualResult).to.deep.equal(expectedResult);
  });
});

describe.only("makeRefObj", () => {
  it("given an empty array, returns an empty object", () => {
    const input = [];
    const actualResult = makeRefObj(input);
    const expectedResult = {};
    expect(actualResult).to.deep.equal(expectedResult);
  });
  it("given an array containing only one object, returns a reference object with key-value pair determined by passed arguments", () => {
    const input1 = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      }
    ];
    const input2 = "title";
    const input3 = "article_id";
    const actualResult = makeRefObj(input1, input2, input3);
    const expectedResult = { "Living in the shadow of a great man": 1 };
    expect(actualResult).to.deep.equal(expectedResult);
  });
  it("given an array containing multiple objects, returns a reference object with key-value pairs determined by passed arguments", () => {
    const input1 = [
      {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: 1542284514171,
        votes: 100
      },
      {
        article_id: 3,
        title: "Eight pug gifs that remind me of mitch",
        topic: "mitch",
        author: "icellusedkars",
        body: "some gifs",
        created_at: 1289996514171
      }
    ];
    const input2 = "title";
    const input3 = "article_id";
    const actualResult = makeRefObj(input1, input2, input3);
    const expectedResult = {
      "Living in the shadow of a great man": 1,
      "Eight pug gifs that remind me of mitch": 3
    };
    expect(actualResult).to.deep.equal(expectedResult);
  });
});

describe("formatComments", () => {});
