require("dotenv").config()

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

module.exports = {PORT, MONGODB_URI, CLIENT_ID, CLIENT_SECRET};