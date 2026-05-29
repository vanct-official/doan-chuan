const express = require('express');
const app = express();
const connectDB = require('./config/db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./config/swagger');
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Swagger setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use((req, res, next) => {
    const allowedOrigins = process.env.CLIENT_URL;
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Parse JSON bodies (Required for POST requests)
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount main application routes
app.use('/api', require('./routes/index'));

app.get('/api', async(req, res)=>{
    try {
        res.send({message: 'Welcome to Back-end!'});
    } catch (error) {
        res.send({error: error.message});
    }
});


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));