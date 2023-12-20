const express = require('express');
const PORT = 8080;
const app = express();
const cors = require('cors');
app.use(cors())


//for database connection
require('dotenv').config();
require('./db');

//for using req.body we hove to use middleware
app.use(express.json());

// First API
app.get('/', (req, res) => {
    console.log("running successfully");
    res.send({ mes: "connected" });
});

// import api from routes file
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});