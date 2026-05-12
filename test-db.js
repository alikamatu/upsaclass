// test-db.js
require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || process.env.MONGOBD_URL; // try both spellings

console.log('Using URI:', uri ? uri.replace(/\/\/(.*)@/, '//***:***@') : 'undefined');

if (!uri) {
  console.error('❌ No MongoDB URI found. Check your .env file.');
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

run();