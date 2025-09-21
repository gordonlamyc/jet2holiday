import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Extra logging for debugging
console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Loaded .env:', process.env.AWS_REGION, process.env.AWS_ACCESS_KEY_ID, process.env.AWS_S3_BUCKET);

// Load environment variables from .env file
dotenv.config();

const app = express();
// Enable CORS for all routes
app.use(cors());
const port = process.env.PORT || 5000;

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// AWS S3 client setup
let s3;
try {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('S3 client initialized.');
} catch (err) {
  console.error('Failed to initialize S3 client:', err);
  process.exit(1);
}

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      const now = new Date().toISOString();
      console.error(`[${now}] [ERROR] No file uploaded in request.`);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    console.log(`[${new Date().toISOString()}] Uploading to S3:`, params);
    await s3.send(new PutObjectCommand(params));
    console.log(`[${new Date().toISOString()}] Upload successful:`, file.originalname);

    res.json({ message: 'File uploaded successfully', fileName: file.originalname });
  } catch (error) {
    const now = new Date().toISOString();
    console.error(`\n[${now}] [UPLOAD ERROR]`);
    if (error && error.stack) {
      console.error(error.stack);
    } else {
      console.error(error);
    }
    console.error(`[END ERROR]`);
    res.status(500).json({ error: 'Failed to upload file', details: error && error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
