
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: '127.0.0.1',
  user: 'reformcrm',
  password: '313314a8a2e38dc6bd4949185a8b9bd7',
  database: 'reformdb',
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in the pool
  queueLimit: 0, // Unlimited queueing for waiting connections
};

// Create a connection pool
const mysqldbpool = mysql.createPool(dbConfig);

// Function to test the database connection
export const testConnection = async () => {
  let connection;
  try {
    // Get a connection from the pool
    connection = await mysqldbpool.getConnection();

    // Execute a simple query to test the connection
    await connection.query('SELECT 1');

    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error; // Rethrow the error to handle it in the main application
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
};

export default mysqldbpool;
