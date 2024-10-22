const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config({ path: './config.env' });

// connect Render redis
const client = redis.createClient({
    url: "redis://127.0.0.1:6379/0"

});

client.on('error', (err) => console.log('Redis Client Error'));

(async () => {
    await client.connect();
    console.log('Redis connected successfully')
})();

module.exports = client;




















// // Function to delete all keys
// async function deleteAllKeys() {
//     try {
//         await client.flushDb(); // Deletes all keys in the current database
//         console.log('All keys deleted from Redis.');
//     } catch (err) {
//         console.error('Error deleting keys:', err);
//     }
// }

// // Example: Call the function to delete all keys
// deleteAllKeys();

