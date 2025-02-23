import express from 'express';
import companyCheckUserRoutes from './routes/companyCheckuserRoutes';
import userLoginRoutes from './routes/userLoginRoutes';
import customerRoutes from './routes/customerRoutes';
import { convertToKatakana } from './controllers/convertKatakanaController';

import cors from 'cors';

import { testConnection } from './utils/dbconfig';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test the database connection when the application starts
testConnection()
  .then(() => {
    console.log('Database connection test passed. Starting server...');
  })
  .catch((error) => {
    console.error('Database connection test failed. Exiting...');
    process.exit(1); // Exit the application if the database connection fails
  });

// Routes
app.get('/', (req, res) => {
  res.send('Vite + Node.js + TypeScript!!!');
});

app.get('/api', (req, res) => {
  res.send('API');
});

app.use('/api',companyCheckUserRoutes);
app.use('/apitext',convertToKatakana);
app.use('/userlogin',userLoginRoutes);
app.use('/customer',customerRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app as a named export
export const viteNodeApp = app;