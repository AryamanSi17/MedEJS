// forestAdmin.js
require('dotenv').config();
const { createAgent } = require('@forestadmin/agent');
const { createMongooseDataSource } = require('@forestadmin/datasource-mongoose');
const connection = require('./db'); // Adjust the path to your db.js file

const forestAdmin = createAgent({
  authSecret: process.env.FOREST_AUTH_SECRET,
  envSecret: process.env.FOREST_ENV_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
});

forestAdmin.addDataSource(createMongooseDataSource(connection.mongoose)); // Adjusted to use the mongoose instance from your db.js

module.exports = forestAdmin;
