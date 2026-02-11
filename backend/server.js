require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user')
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express()

// middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true 
}));
app.use(express.json())
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/user', userRoutes)

app.use(errorHandler);

// listen for requests
app.listen(process.env.PORT, () => {
  console.log('Server listening on port', process.env.PORT)
})