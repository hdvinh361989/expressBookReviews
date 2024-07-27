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
  res.session.authorization = {accessToken,username};
  return res.status(200).json({message:`${username} has been logged in`})
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const book = books[isbn];
  if(!book){
    return res.status(400).json({message:`Can't find book with id ${isbn}`});
  }
  const {username} = req.session.authorization;
  const {review}=req.body;
  book.reviews[username] =review;
  return res.status(200).json({message:`Saved successfully`});
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
  return res.status(200).json({message:`Deleted book with id ${isbn}`});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
