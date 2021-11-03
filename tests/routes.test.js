process.env.NODE_ENV = "test";
const db = require("../db");
const app = require("../app");
const request = require("supertest");

describe("book Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
    let u = await db.query(
      `INSERT INTO books (isbn,amazon_url,author,language, pages, publisher, title, year) VALUES ('test1', 'test1.com', 'john', 'english', 100, 'treehosue', 'testing 234', 2020), ('test2', 'test2.com', 'henry', 'english', '200', 'scholastic', 'book test', 1999)`
    );
  });

  describe("POST /books", function () {
    const book = {
      isbn: "12345",
      amazon_url: "string",
      author: "string",
      language: "string",
      pages: 100,
      publisher: "string",
      title: "string",
      year: 2021,
    };
    test("can add book", async function () {
      let response = await request(app).post("/books").send(book);
      const dbBook = await db.query(`SELECT * FROM books WHERE isbn='12345'`);
      expect(response.body).toEqual({ book });
      expect(dbBook.rows[0]).toEqual(book);
    });
    test("Prevents creating book without required title", async function () {
      const response = await request(app)
          .post(`/books`)
          .send({year: 2000});
      expect(response.statusCode).toBe(400);
    });
  });
  describe("POST /books", function () {
    test("can get all books", async function () {
      const books = await db.query(`SELECT * FROM books ORDER BY isbn desc`);
      const response = await request(app).get("/books/");
      expect(response.body.books).toEqual(books.rows);
    });
  });

  describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
      const response = await request(app)
          .get(`/books/test1`)
      expect(response.body.book).toHaveProperty("isbn");
      expect(response.body.book.isbn).toBe('test1');
    });
  
    test("Responds with 404 if can't find book in question", async function () {
      const response = await request(app)
          .get(`/books/999`)
      expect(response.statusCode).toBe(404);
    });
  });
  
  describe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app)
          .delete(`/books/test1`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
  });

});

afterAll(async function () {
  await db.end();
});
