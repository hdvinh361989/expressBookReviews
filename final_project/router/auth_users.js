const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router()
const {JWT_SECRET} = require('../config/config').config

let users = [];

const isValid = (username)=>{ //returns boolean
  const user = users.find(user=>user.username === username);
  return !user;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user=>user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if(!authenticatedUser(username,password)){
    return res.status(400).json({message:"Invalid username or password"});
  }

  const accessToken = jwt.sign({password},JWT_SECRET,{expiresIn: '1h'});
  // Store token and username to session
  req.session.authorization = {accessToken,username};
  req.session.save();
  return res.status(200).json({message:`Customer successfully logged in`})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const book = books[isbn];
  if(!book){
    return res.status(400).json({message:`Can't find book with id ${isbn}`});
  }
  const {username} = req.session.authorization;
  const {review}=req.query;
  book.reviews[username] =review;
  return res.status(200).json({message:`The review for the book with ISBN ${isbn} has been added/updated`});
});

// Delete review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const book = books[isbn];
  // If book doesn't exist
  if(!book){
    return res.status(400).json({message:`Can't find book with id ${isbn}`});
  }

  const {username} = req.session.authorization;
  // If review does not exist
  if(!book.reviews[username]){
    return res.status(400).json({message:`The user ${username} does not have any review for the book with id ${isbn}`});
  }

  delete book.reviews[username];
  return res.status(200).json({message:`Reviews for the ISBN ${isbn} posted by the user ${username} deleted`});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
