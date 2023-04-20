const _ = require('underscore');
const Express = require('express');
const bodyParser = require('body-parser');
const Van = require('./Models/Van');
const User = require('./Models/User');
const Response = require('./Models/Response');
const express = Express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { result } = require('underscore');
const mongoConnect = require('./database').mongoConnect;
const TokenParser = require('./TokenParser');

const JWT_SECRET_KEY = 'gfg_jwt_secret_key'
const TOKEN_HEADER_KEY = 'gfg_token_header_key'

express.use(bodyParser.urlencoded({extended: false}));

express.post('/login', (req, res)=>{
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password

    User.getUser(email)
        .then (users => {
            if (users.length == 0) {
                var response = new Response(400, "Wrong email or password")
                res.status(400).send(response);
            } else {
                const user = users[0];
                const hashedPass = user['password'];
                res.setHeader('content-type', 'application/json');
                bcrypt.compare(password, hashedPass, (err, result) => {
                    if (result) {
                        let data = {
                            time: Date(),
                            email: email,
                        }
                        const token = jwt.sign(data, JWT_SECRET_KEY);
                        var response = new Response(200, "OK")
                        response['accessToken'] = token;
                        res.send(response);
                    } else {
                        var response = new Response(400, "Wrong username or password")
                        res.status(400).send(response);
                    }
                });
            }
        });
    
});

express.post('/register', (req, res)=>{
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    res.setHeader('content-type', 'application/json');
    User.getUser(email)
    .then(users => {
        if (users.length === 0) {
            bcrypt.hash(password, 10)
                .then (hashedPassword => {
                    const user = new User(name, email, hashedPassword);
                    user.save();
                    var response = new Response(200, "OK")
                    response['data'] = 'Register completed successfully.';
                    res.send(response);
                });
        } else {
            var response = new Response(400, "User already exists.");
            res.send(response);
        }
    }); 
});

express.get('/getUser', (req, res) => {
    const email = TokenParser.getEmail(req.headers.authorization)
    res.setHeader('content-type', 'application/json');
    User.getUser(email)
    .then(users => {
        const user = users[0];
        var response = new Response(200, "OK")
        delete user ['password'];
        response['user'] = user;
        res.send(response);
    });
});

express.post('/createVan', (req, res)=>{
    const email = TokenParser.getEmail(req.headers.authorization)
    Van.findByPlate(req.body.plateNumber) 
    .then (vans => {
        if (vans.length == 0) {
            Van.findByProductionId(req.body.gatewayProductionId)
            .then (vans => {
                if (vans.length == 0) {
                    const van = new Van(req.body.name, req.body.brand, req.body.model, req.body.plateNumber, email, req.body.gatewayProductionId);
                    van.save()
                    res.setHeader('content-type', 'application/json');
                    var response = new Response(200, "OK")
                    response['data'] = van;
                    res.send(response);
                } else {
                    res.setHeader('content-type', 'application/json');
                    var response = new Response(400, "Van already exists.")
                    res.send(response);
                }
            });
            
        } else {
            res.setHeader('content-type', 'application/json');
            var response = new Response(400, "Van already exists.")
            res.send(response);
        }
    });
    
});

express.post('/deleteVan', (req, res)=>{
    const email = TokenParser.getEmail(req.headers.authorization)
    Van.findByPlate(req.body.plateNumber) 
    .then (vans => {
        if (vans.length == 0) {
            res.setHeader('content-type', 'application/json');
            var response = new Response(400, "Requested van does not exist.")
            res.send(response);
        } else {
            const van = vans[0];
            Van.deleteVan(van)
            res.setHeader('content-type', 'application/json');
            var response = new Response(200, "OK")
            response['data'] = "Van deleted";
            res.send(response);
        }
    });
    
});

express.get('/getVans', (req,res) => {
    const email = TokenParser.getEmail(req.headers.authorization);
    Van.find(email)
        .then(vans => {
            res.setHeader('content-type', 'application/json');
            var response = new Response(200, "OK")
            vans.forEach(element => {
                delete element['ownerMail'];
            });
            response['data'] = vans;
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send(err);
        });
})

mongoConnect(client=>{
    express.listen(3000);
    console.log(client);
});
