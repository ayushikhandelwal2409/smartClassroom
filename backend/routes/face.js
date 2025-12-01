const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Helper function to calculate cosine similarity
 */
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let dot = 0, norm1 = 0, norm2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denominator === 0 ? 0 : dot / denominator;
}

/**
 * Get face embedding from ML server using CLIP
 */
async function getFaceEmbedding(imageBuffer) {
  try {
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'face.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post('http://127.0.0.1:5000/embed-image', form, {
      headers: form.getHeaders()
    });

    return response.data.embedding;
  } catch (error) {
    console.error('Error getting face embedding from ML server:', error);
    return null;
  }
}

/**
 * Get student face embeddings from their profile images
 */
async function getStudentFaceEmbeddings(students) {
  const embeddings = {};
  
  for (const student of students) {
    try {
      if (!student.image) continue;
      
      let imageBuffer = null;
      
      // Check if image is a URL or local path
      if (student.image.startsWith('http://') || student.image.startsWith('https://')) {
        // Fetch image from URL (from seed data)
        try {
          console.log(`Fetching image from URL for student ${student.studentId}: ${student.image}`);
          const response = await axios.get(student.image, { 
            responseType: 'arraybuffer',
            timeout: 10000 // 10 second timeout
          });
          imageBuffer = Buffer.from(response.data);
          console.log(`✓ Successfully fetched image for student ${student.studentId}`);
        } catch (error) {
          console.error(`✗ Failed to fetch image from URL for student ${student.studentId}: ${student.image}`, error.message);
          continue;
        }
      } else {
        // Local file path - images are stored in uploads/profiles/
        // Try different possible paths
        const possiblePaths = [
          path.join(__dirname, '..', student.image), // Direct path from DB
          path.join(__dirname, '..', 'uploads', 'profiles', path.basename(student.image)), // From uploads/profiles
          path.join(__dirname, '..', 'uploads', path.basename(student.image)), // From uploads root
          student.image.startsWith('/') ? student.image : path.join(__dirname, '..', student.image)
        ];
        
        let imagePath = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            imagePath = possiblePath;
            break;
          }
        }
        
        if (!imagePath) {
          // Try fetching from localhost URL as fallback
          try {
            const imageUrl = `http://localhost:5000/${student.image}`;
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
          } catch (urlError) {
            console.log(`Image not found for student ${student.studentId}. Tried paths and URL.`);
            continue;
          }
        } else {
          // Read image file
          imageBuffer = fs.readFileSync(imagePath);
        }
      }
      
      // Get embedding from ML server
      if (imageBuffer) {
        const embedding = await getFaceEmbedding(imageBuffer);
        
        if (embedding) {
          embeddings[student.studentId] = embedding;
          console.log(`✓ Processed face embedding for student ${student.studentId} (${student.Name})`);
        } else {
          console.log(`✗ Failed to get embedding for student ${student.studentId}`);
        }
      }
    } catch (error) {
      console.error(`Error processing student ${student.studentId}:`, error.message);
    }
  }
  
  return embeddings;
}

/**
 * POST /api/face/scan
 * Scan image for face recognition and identify students
 */
router.post('/scan', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided' });
    }

    const { section, subjectCode, period } = req.body;

    if (!section || !subjectCode || !period) {
      return res.status(400).json({ 
        msg: 'Missing required fields: section, subjectCode, period' 
      });
    }

    // Get all students in the section
    const students = await Student.find({ section: section.toUpperCase() })
      .select('studentId Name section image');

    if (students.length === 0) {
      return res.status(404).json({ msg: 'No students found in this section' });
    }

    console.log(`Processing face recognition for ${students.length} students in section ${section}`);

    // Get face embeddings for all students
    const studentEmbeddings = await getStudentFaceEmbeddings(students);
    
    if (Object.keys(studentEmbeddings).length === 0) {
      return res.status(400).json({ 
        msg: 'No student images found for face recognition. Please ensure students have profile images uploaded.' 
      });
    }

    // Get embedding for the uploaded class photo
    const classPhotoEmbedding = await getFaceEmbedding(req.file.buffer);
    
    if (!classPhotoEmbedding) {
      return res.status(500).json({ 
        msg: 'Failed to process class photo. Please ensure ML server is running on port 5000.' 
      });
    }

    // Match faces using cosine similarity
    const results = [];
    const threshold = 0.6; // 60% similarity threshold

    for (const student of students) {
      const studentEmbedding = studentEmbeddings[student.studentId];
      
      if (!studentEmbedding) {
        // Student doesn't have an image, skip
        continue;
      }

      // Calculate similarity
      const similarity = cosineSimilarity(classPhotoEmbedding, studentEmbedding);
      
      if (similarity >= threshold) {
        results.push({
          studentId: student.studentId,
          studentName: student.Name,
          status: 'present',
          confidence: Math.round(similarity * 100) / 100
        });
      }
    }

    console.log(`Face recognition completed: ${results.length} students matched`);

    res.json({
      msg: 'Face recognition scan completed',
      results,
      totalStudents: students.length,
      matched: results.length,
      threshold: threshold
    });
  } catch (error) {
    console.error('Error in face recognition scan:', error);
    res.status(500).json({ 
      msg: 'Server Error', 
      error: error.message,
      note: 'Make sure the ML server is running on port 5000'
    });
  }
});

module.exports = router;

