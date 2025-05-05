// This file serves as the serverless function entry point for Vercel
import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
export default async function handler(req, res) {
  try {
    // Initialize the app with routes
    const server = await registerRoutes(app);
    
    // Create a server instance
    const httpServer = createServer(server);
    
    // Forward the request to the Express app
    httpServer.emit('request', req, res);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}