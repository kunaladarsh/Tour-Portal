const mongoose = require('mongoose');
const dotenv = require('dotenv');
const redis = require('redis');
// const { createClient } = require('redis');

dotenv.config({ path: './config.env' });

const app = require('./app');

const uri = process.env.DATABASE;

// const port = process.env.PORT || 4000;
const port = 3000 || 4000;

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('You successfully connected to MongoDB!'))
  .catch(err => console.error('Error connecting to MongoDB:', err), 10);

// server connections
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


// // connect Render redis
//   const client = redis.createClient({
//       url: process.env.REDIS_URL
//   });

//   client.on('error', (err) => console.log('Redis Client Error'));
  
//   (async () => {
//   await client.connect();
//   console.log('Redis connected successfully')
//   })();

//   module.exports = client;


















///////////////////////////////////////////////////////////////
// const { Sequelize } = require('sequelize');
// const databasestring = process.env.databaseURL2;
// const sequelize = new Sequelize(databasestring, {
//   dialect: 'postgres',
//   dialectOptions: {
//       ssl: {
//           require: true,
//           rejectUnauthorized: false // This might be necessary depending on the SSL certificate
//       }
//   },
//   logging: false,
// });

// // Test the connection
// sequelize.authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully to MySQL.');
//     })
//     .catch(err => {
//         console.error('Unable to connect to the MySQL database');
//     });

    
// module.exports = sequelize;


///////////////////////////////////////////////////////////////
// Connect using Pg
// // dbConnection.js
// const { Pool } = require('pg');

// // Replace these values with your actual Render database connection details
// const pool = new Pool({
//   connectionString: process.env.databaseURL,
//   ssl: {
//     rejectUnauthorized: false, // This might be necessary for some cloud-hosted databases
//   },
// });


// // Test the connection
// pool.connect((err, client, release) => {
//   if (err) {
//     return console.error('Error acquiring client', err.stack);
//   }
//   client.query('SELECT NOW()', (err, result) => {
//     release();
//     if (err) {
//       return console.error('Error executing query', err.stack);
//     }
//     console.log('Connection successful:', result.rows);
//   });
// });


/*
// Create a Redis client
const redisClient = redis.createClient({
  url: 'redis://127.0.0.1:6379', // Use URL syntax for clarity
});

// Handle errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

async function example() {
  try {
    await redisClient.set('key', 'values-check', redis.print);
    await redisClient.set('demo', 'we are learning nodejs and redis', redis.print);
    await redisClient.set('pull', 'docker pull redis', redis.print);
    await redisClient.set('redis', 'redis are connected', redis.print);

    console.log('Values set in Redis');
  } catch (err) {
    console.error('Redis error:', err);
    res.status(500).send('Redis is not available');
  }
}
example();


async function getValues(req, res) {
  try {
    const value1 = redisClient.get('key', (err, keyValue) => {
      if (err) throw err;
      console.log(`key: ${keyValue}`);
    });

    const value2 = redisClient.get('demo', (err, demoValue) => {
      if (err) throw err;
      console.log(`demo: ${demoValue}`);
    });


    redisClient.get('pull', function(err, pullValue){
      if (err) throw err;
      console.log(`pull: ${pullValue}`);
    });

    const rvalue = redisClient.get('redis', (err, value) => console.log('redis: ' + value));
    console.log("redis value" + rvalue);
    const value3 =  redisClient.del('key');

    redisClient.get('key', (err, deletedKeyValue) => {
      if (err) throw err;
      console.log(`key (after deletion): ${deletedKeyValue}`);
     });

    res.json({ 'key': value1, 'demo': value2, 'pull': value3, 'redis': rvalue });

  } catch (err) {
    console.error('Redis error:', err);
    res.status(500).send('Redis is not available');
  }
}

app.get('/get', getValues);
*/