module.exports = {
    mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false 
    // strictQuery: false,
    }
  };