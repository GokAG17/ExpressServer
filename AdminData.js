const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Pool } = require('pg');
const xlsx = require('xlsx'); 
const path = require('path');
const bcrypt = require('bcrypt');


// Configure multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Database connection configuration
const dbConfig = {
  user: 'postgres',
  password: 'Gokul123@',
  host: 'localhost',
  dialect: 'postgres',
  port: "5432", 
  database: 'signup',
};

// Helper function to parse Excel data
function parseExcel(buffer) {
  try {
    // Read the Excel buffer and get the first sheet
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert sheet data to an array of objects (rows)
    const excelData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Remove the first row if it contains headers (uncomment if needed)
    // excelData.shift();

    return excelData;
  } catch (error) {
    console.error('Error parsing Excel data:', error);
    return []; // Return an empty array on error
  }
}

/// Upload data from Excel file to Accounts table
router.post('/uploadData', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const pool = new Pool(dbConfig);

    // Parse Excel file and insert data into Accounts table
    const excelData = parseExcel(file.buffer);

    // Add console.log to print parsed excelData
    console.log(excelData);

    const insertQuery =
      'INSERT INTO "Accounts" ("firstName", "lastName", "email", "password", "phoneNumber", "role", "university", "rollNo", "department", "createdAt", "updatedAt") ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())';

    for (const row of excelData) {
      const [firstName, lastName, email, password, phoneNumber, role, university, rollNo, department] = row;
      const hashedPassword = await bcrypt.hash(String(password), 10);
      await pool.query(insertQuery, [firstName, lastName, email, hashedPassword, phoneNumber, role, university, rollNo, department]);
    }

    pool.end();

    res.status(200).json({ message: 'File uploaded and data inserted' });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  

// Fetch data from Accounts table and generate Excel sheet
router.get('/downloadData', async (req, res) => {
    try {
      const pool = new Pool(dbConfig);
      const result = await pool.query('SELECT * FROM "Accounts"');
  
      const data = result.rows.map((row) => ({
        'First Name': row.firstName,
        'Last Name': row.lastName,
        'Email': row.email,
        'Password': row.password,
        'Phone Number': row.phoneNumber,
        'Role': row.role,
        'University': row.university,
        'Roll No': row.rollNo,
        'Department': row.department,
      }));
  
      // Create a new workbook and add a worksheet
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(data);
  
      // Add the worksheet to the workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Accounts');
  
      // Generate a unique filename for the Excel sheet
      const excelFileName = `Accounts_${Date.now()}.xlsx`;
  
      // Save the Excel file
      const excelFilePath = path.join(__dirname, 'uploads', excelFileName);
      xlsx.writeFile(workbook, excelFilePath);
  
      // Send the Excel file as a response
      res.download(excelFilePath, excelFileName, (err) => {
        if (err) {
          console.error('Error sending Excel file:', err);
        }
    
      });
    } catch (error) {
      console.error('Error generating Excel sheet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
