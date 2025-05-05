import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvFilePath = path.join(__dirname, '../attached_assets/exercises - exercises.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf8');

// Function to import the exercises
async function importExercises() {
  try {
    const response = await axios.post('http://localhost:5000/api/exercises/bulk-import', {
      csvContent
    });
    
    console.log('Import successful:', response.data.message);
    console.log(`Imported ${response.data.exercises.length} exercises.`);
    
    // Log the imported exercises
    response.data.exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} (${exercise.category})`);
    });
  } catch (error) {
    console.error('Error importing exercises:', error.response?.data || error.message);
  }
}

// Execute the import
importExercises();