# be-nc-news

A RESTful API serving as the back-end for Northcoders News - a social news aggregation, web content rating, and discussion website along the lines of Reddit.

Northcoders News has articles which are divided into topics. Each article has user curated ratings and can be up or down voted. The API allows users to add (and remove) comments about an article, which can also be up or down voted.

The database is PSQL and the API interacts with it using Knex.

A hosted version can be found at https://djmac19-be-nc-news.herokuapp.com.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To run the project, you will need to have 'Node.js' (v12 or later) and 'Postgres' (v10 or later) installed.

```
npm i node
npm i pg
```

### Installing

To get a development environment running...

Clone this repository:

```
git clone https://github.com/djmac19/be-nc-news.git#
cd be-nc-news
```

Install dependencies:

```
npm i express
npm i knex
npm i cors
```

Set up and seed local database with development data:

```
npm run seed-dev
```

Create new file called 'knexfile.js' in root directory, inserting your 'Postgres' username and password (not required on macOS):

```
const { DB_URL } = process.env;
const ENV = process.env.NODE_ENV || "development";

const baseConfig = {
  client: "pg",
  migrations: {
    directory: "./db/migrations"
  },
  seeds: {
    directory: "./db/seeds"
  }
};

const customConfig = {
  production: {
    connection: `${DB_URL}?ssl=true`
  },
  development: {
    connection: {
      database: "nc_news",
      username: <username>,
      password: <password>
    }
  },
  test: {
    connection: {
      database: "nc_news_test",
      username: <username>,
      password: <password>
    }
  }
};

module.exports = { ...customConfig[ENV], ...baseConfig };
```

Start server:

```
npm start
```

This will host the server locally on port 9090.

## Running the tests

To run the automated tests for this system...

Install dev dependencies:

```
npm i chai
npm i chai-sorted
npm i chai-each
npm i mocha
npm i nodemon
npm i supertest
```

Seed local database with test data:

```
npm run seed-test
```

Test utility functions:

```
npm run test-utils
```

Test endpoints:

```
npm test
```

## Endpoints

The server has the following endpoints:

```
GET /api/topics

GET /api/users/:username

GET /api/articles/:article_id
PATCH /api/articles/:article_id

POST /api/articles/:article_id/comments
GET /api/articles/:article_id/comments

GET /api/articles

PATCH /api/comments/:comment_id
DELETE /api/comments/:comment_id

GET /api
```

See https://djmac19-be-nc-news.herokuapp.com/api (or http://localhost:9090/api if hosting server locally) for more details on the various routes.

## Built With

- [Node.js](https://nodejs.org/en/docs/) - JavaScript runtime environment
- [Express](https://expressjs.com/en/api.html) - web application framework
- [PostgreSQL](https://www.postgresql.org/docs/) - relational database management system
- [Knex.js](http://knexjs.org/) - SQL query builder
- [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), [Supertest](https://github.com/visionmedia/supertest) - testing

## Authors

- **Daniel McEntee** - [djmac19](https://github.com/djmac19)

## Acknowledgments

This project was created as part of a portfolio piece on a coding bootcamp, so hat tip to [Northcoders](https://northcoders.com/)!
