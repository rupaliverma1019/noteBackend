const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator'); //import validator
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchuser = require('../middleware/fetchuser')

// Route 1 for  create a user : Post "/api/auth/register" . No login required {api for user registration}
//http://localhost:8080/api/auth/register
router.post('/register', [
    body('name', 'Enter a valid Name').isLength({ min: 5 }), // validator is a middle ware which is use to validate your body request
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be ').isLength({ min: 5 }),

], async(req, res) => {

    // If there is an error , return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({ errors: errors.array() });
    }
    // check weather the email exist already 
    try {
        let user = await User.findOne({ email: req.body.email })

        if (user) {
            return res.status(400).json({ error: "sorry a user with this email is already exists" })
        }


        // Bcrypt turns a simple password into fixed-length characters called a hash. In this it brcrypt apply some algorithm and convert a normal password in to hashpassword 
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // if user doesnot exist create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })

        const data = {
            user: {
                id: user.id
            }
        }

        // jwt is used to generate a token  which is used to  share security information between two parties — a client and a server.
        const authtoken = jwt.sign(data, process.env.JWT_SECRET);
        console.log(authtoken)
            // res.json(req.body)
            // res.status(200).send("User created successfully")


        res.json({ authtoken })
    } catch (err) {
        console.log(err.message)
        res.status(500).send("Some error occured")
    }


})



// Route 2 for login This code represents a route handler for user login. It uses the express-validator middleware to validate the email and password in the request body, then checks if the user exists and compares the provided password with the hashed password stored in the database. If everything is valid, it generates a JWT token and sends it as a response. If there are any errors during the process, appropriate error responses are sent.
//http://localhost:8080/api/auth/login
router.post('/login', [
        // validator is a middle ware which is use to validate your body request
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password can,t be blank').isLength({ min: 5 })
    ],
    async(req, res) => {
        let success = false;
        // If there is an error , return Bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(500).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {

            let user = await User.findOne({ email })

            if (!user) {
                success = false;
                return res.status(400).json({ success, error: "Please login with correct email" })
            }

            const passwordCompare = await bcrypt.compare(password, user.password)

            if (!passwordCompare) {
                success = false;
                return res.status(400).json({ success, error: "Please login with correct password" })
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, process.env.JWT_SECRET);
            success = true;
            res.json({ success, authtoken })


        } catch (err) {
            console.log(err.message)
            res.status(500).send(err.message)
        }

    }

)





router.post('/getuser', fetchuser, async(req, res) => {
    try {
        userId = req.user.id; // Extracting user ID from the request object
        const user = await User.findById(userId).select("-password"); // Finding the user by ID
        res.send(user); // Sending the user's data as the response
    } catch (err) {
        console.log(err.message);
        // res.status(500).send(err.message); // Handling the error and sending an error response
    }
});

module.exports = router;