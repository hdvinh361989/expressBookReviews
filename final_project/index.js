const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const {JWT_SECRET} = require('./config/config').config;

const app = express();

// Parse json
app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const {accessToken} = req.session.authorization;

    if(!accessToken){
        res.status(401).json({message:"Not logged in"});
        return;
    }

    jwt.verify(accessToken, JWT_SECRET, (err, user) => {
        if(err){
            res.status(403).json({message:"Unauthorized"});
            return;
        }

        if(user){
            req.user=user;
            next();
        }
    });

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
