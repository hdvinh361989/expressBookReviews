const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const body = req.body;
  const {username, password, firstName,} = req.body;
  if(!username || !password){
    return res.status(400).json({message:"Username and password are required"});
  }

  if(!isValid(username)){
    return res.status(400).json({message:"The username is in use"});
  }
  users.push({username, password});
  res.status(201).json({message:`${username} has been registered`});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const {isbn} = req.params;
  const book=books[isbn]
  if(!book){
    return res.status(404).json({message:`Book with ${isbn} not found`});
  }
    res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const {author} = req.params;
  const book = Object.values(books).find(book=> book.author.toLowerCase()===author.toLowerCase());
  if(!book){
    return res.status(404).json({message:`Book with ${author} not found`});
  }
  res.status(200).json(book);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const {title} = req.params;
  const foundBooks = Object.values(books).filter(book=> !!book.title.match(new RegExp(title, "i")));
  if(!foundBooks){
    return res.status(404).json({message:`Book(s) with ${title} not found`});
  }
  res.status(200).json(foundBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const {isbn} = req.params;
  const book = books[isbn];
  if(!book){
    return res.status(404).json({message:`Book with ${isbn} not found`});
  }
  res.status(200).json(book.reviews);
});

module.exports.general = public_users;
