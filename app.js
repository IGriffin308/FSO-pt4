const config = require('./utils/config')
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(express.static('dist'));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRouter);

// app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app