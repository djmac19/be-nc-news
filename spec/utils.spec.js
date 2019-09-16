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
    formatDates(input);
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

describe("makeRefObj", () => {
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

describe.only("formatComments", () => {
  it("given an empty array, returns an empty array", () => {
    const input = [];
    const actualResult = formatComments(input);
    const expectedResult = [];
    expect(actualResult).to.deep.equal(expectedResult);
  });
  it("does not mutate original input", () => {
    const input1 = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const input2 = { "They're not exactly dogs, are they?": 9 };
    formatComments(input1, input2);
    expect(input1, input2).to.deep.equal([
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ]);
  });
  it("given an array containing only one object, renames created_by key to author", () => {
    const input1 = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const input2 = { "They're not exactly dogs, are they?": 9 };
    const actualResult = formatComments(input1, input2);
    expect(actualResult[0].author).to.equal("butter_bridge");
    expect(actualResult[0].created_by).to.equal(undefined);
  });
  it("given an array containing only one object, replaces belongs_to property with article_id", () => {
    const input1 = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const input2 = { "They're not exactly dogs, are they?": 9 };
    const actualResult = formatComments(input1, input2);
    expect(actualResult[0].article_id).to.equal(9);
    expect(actualResult[0].belongs_to).to.equal(undefined);
  });
  it("given an array containing only one object, converts timestamp into javascript date object", () => {
    const input1 = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      }
    ];
    const input2 = { "They're not exactly dogs, are they?": 9 };
    const actualResult = formatComments(input1, input2);
    expect(actualResult[0].created_at).to.deep.equal(new Date(1511354163389));
  });
  it("given an array containing multiple objects, returns an array of formatted comment objects", () => {
    const input1 = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        belongs_to: "They're not exactly dogs, are they?",
        created_by: "butter_bridge",
        votes: 16,
        created_at: 1511354163389
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        belongs_to: "Living in the shadow of a great man",
        created_by: "butter_bridge",
        votes: 14,
        created_at: 1479818163389
      }
    ];
    const input2 = {
      "They're not exactly dogs, are they?": 9,
      "Living in the shadow of a great man": 1
    };
    const actualResult = formatComments(input1, input2);
    const expectedResult = [
      {
        body:
          "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        article_id: 9,
        author: "butter_bridge",
        votes: 16,
        created_at: new Date(1511354163389)
      },
      {
        body:
          "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
        article_id: 1,
        author: "butter_bridge",
        votes: 14,
        created_at: new Date(1479818163389)
      }
    ];
    expect(actualResult).to.deep.equal(expectedResult);
  });
});
