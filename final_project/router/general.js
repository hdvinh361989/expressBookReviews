const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const body = req.body;
    const {username, password, firstName,} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (!isValid(username)) {
        return res.status(400).json({message: "The username is in use"});
    }
    users.push({username, password});
    res.status(201).json({message: `Customer successfully registered. Now you can login`});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const results = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(books), 500)
    });
    res.status(200).json(results);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const {isbn} = req.params;
    const book = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(books[isbn]), 500)
    });
    if (!book) {
        return res.status(404).json({message: `Book with ${isbn} not found`});
    }
    res.status(200).json(book);
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const {author} = req.params;
    const foundBooks = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(Object.values(books).filter(book => !!book.author.match(new RegExp(author, "i"))))
        }, 500)
    });
    if (!foundBooks) {
        return res.status(404).json({message: `Books with ${author} not found`});
    }
    res.status(200).json({booksbyauthor:foundBooks});
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const {title} = req.params;
    const foundBooks = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(Object.values(books).filter(book => !!book.title.match(new RegExp(title, "i"))))
        }, 500)
    });
    if (!foundBooks) {
        return res.status(404).json({message: `Book(s) with ${title} not found`});
    }
    res.status(200).json({booksbytitle:foundBooks});
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
    const {isbn} = req.params;
    const book = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(books[isbn]), 500)
    });
    if (!book) {
        return res.status(404).json({message: `Book with ${isbn} not found`});
    }
    res.status(200).json(book.reviews);
});

module.exports.general = public_users;
