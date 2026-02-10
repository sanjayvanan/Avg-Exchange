require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/user')
const { errorHandler } = require('./middleware/errorMiddleware');

// express app
const app = express()

// middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true // Required for cookies to be sent/received
}));
app.use(express.json())
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/user', userRoutes)


//after the routes
app.use(errorHandler);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })