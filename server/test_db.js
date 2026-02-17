require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL.split('@')[1]); // Log only host for safety
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

testConnection();
