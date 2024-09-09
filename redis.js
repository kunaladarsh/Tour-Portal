const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config({ path: './config.env' });

// connect Render redis
const client = redis.createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error'));

(async () => {
await client.connect();
console.log('Redis connected successfully')
})();

module.exports = client;
