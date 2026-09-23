import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import path from 'path'

import contactRoutes from './routes/contactRoutes.js';
import morgan from 'morgan';
import dbconnection from './config/db.js'
import indexRoutes from './routes/index.routes.js'
import { GlobelErrorHandaling } from './middleware/globelError.js';
import { ResetPasswordpage } from './controllers/user/v1/user.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost'

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'))

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// API Routes

app.use('/api/contact', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({status: 'ok',brand: 'Shveraa',timestamp: new Date().toISOString()});
});

// Root route
app.get('/reset-password/:token',ResetPasswordpage)
app.use('/api/v1', indexRoutes)
app.get('/', (req, res) => {res.send('Shveraa Jewellery E-commerce API is running.');});
app.use(GlobelErrorHandaling)

// Start server
app.listen(PORT, (error) => {
  if (!error) {
    console.log(`[Shveraa Server] Running on port ${PORT} (http://${HOST}:${PORT})`);
    dbconnection();
  } else {
    console.log("Server starting probleme", error)
  }

});
