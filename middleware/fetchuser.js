const jwt = require('jsonwebtoken')
require('dotenv').config();

const fetchuser = (req, res, next) => {
    // Get the user from the jwt webtoken and add id to req object
    const token = req.header('auth-token'); // Extract the JWT token from the request header

    // Check if the token is missing
    if (!token) {
        // If the token is missing, send a 401 Unauthorized response
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // Verify the JWT token using the secret key
        const data = jwt.verify(token, process.env.JWT_SECRET);

        // Extract the user object from the decoded JWT data and add it to the request object
        req.user = data.user;

        // Call the next middleware function
        next();
    } catch (err) {
        // Handle errors, usually related to token verification or decoding
        console.log(err.message);
        res.status(500).send(err.message);
    }
}

module.exports = fetchuser;




// It expects three parameters: req (request), res (response), and next (a function to call the next middleware in the stack).

// It first attempts to extract the JWT token from the auth-token header of the incoming HTTP request.

// If the token is missing, it sends a 401 Unauthorized response, indicating that the user needs to authenticate using a valid token.

// If the token is present, it tries to verify the token using the provided process.env.JWT_SECRET, which is the secret key used to sign the JWT when it was generated.

// If verification is successful, it extracts the user object from the decoded JWT data and attaches it to the req object. This allows downstream route handlers to access the authenticated user's information.

// It then calls the next() function to proceed to the next middleware in the stack or the actual route handler.

// If any errors occur during token verification or decoding, it logs the error message and sends a 500 Internal Server Error response.