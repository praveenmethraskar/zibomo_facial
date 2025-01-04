import AWS from 'aws-sdk';
import { Readable } from 'stream';
import logger from '../logging/logger.js';

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

/**
 * Upload image to AWS S3
 * @param {string} image - Base64-encoded image data
 * @param {string} orderId - Order ID for naming the file
 * @param {string} type - Type of the image (e.g., "profile", "order")
 * @returns {object} - The uploaded file URL and file name
 */
export const uploadImageToS3 = async (image, orderId, type) => {
    if (!image || !orderId) {
        throw new Error('Image and orderId are required');
    }

    const bucketName = process.env.AWS_BUCKET_NAME;
    const fileName = `${orderId}.jpg`;

    try {
        const buffer = Buffer.from(image, 'base64');

        const params = {
            Bucket: bucketName,
            Key: `${type}/${fileName}`, // Folder structure inside the bucket
            Body: buffer,
            ContentType: 'image/jpeg',
            ACL: 'public-read', // Make image publicly accessible
        };

        const uploadResult = await s3.upload(params).promise();

        return {
            imageUrl: uploadResult.Location, // URL of the uploaded image
            fileName,
        };
    } catch (err) {
        logger.error('Error uploading image to S3: ' + err);
        throw new Error('Failed to upload image');
    }
};

/**
 * Download image from AWS S3
 * @param {string} fileName - File name to be downloaded
 * @param {string} type - Type of the image (e.g., "profile", "order")
 * @returns {string} - Base64 encoded image
 */
export const downloadImageFromS3 = async (fileName, type) => {
    try {
        const bucketName = process.env.AWS_BUCKET_NAME;

        const params = {
            Bucket: bucketName,
            Key: `${type}/${fileName}`,
        };

        const data = await s3.getObject(params).promise();

        const base64Image = data.Body.toString('base64');
        return base64Image;
    } catch (err) {
        logger.error('Error downloading image from S3: ' + err);
        throw new Error('Failed to download image');
    }
};

/**
 * Detect a face from a Base64 image and return the face ID
 * @param {string} base64Image - Base64-encoded image data
 * @returns {string} Face ID of the detected face
 */
const getFaceIdFromBase64 = async (base64Image) => {
    try {
        const params = {
            Image: {
                Bytes: Buffer.from(base64Image, 'base64')
            }
        };

        const response = await rekognition.detectFaces(params).promise();

        if (response.FaceDetails.length === 0) {
            throw new Error('No face detected');
        }

        return response.FaceDetails[0].FaceId; // Face ID (using Rekognition's face id)
    } catch (err) {
        logger.error('Error detecting face: ' + err);
        throw new Error('Failed to detect face');
    }
};

/**
 * Compare two faces using Rekognition and return match confidence
 * @param {string} faceId1 - Face ID of first image
 * @param {string} faceId2 - Face ID of second image
 * @returns {number} - Match confidence (0 to 100)
 */
const compareFaces = async (faceId1, faceId2) => {
    try {
        const params = {
            SourceImage: {
                S3Object: {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `profile/${faceId1}`
                }
            },
            TargetImage: {
                S3Object: {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `profile/${faceId2}`
                }
            }
        };

        const result = await rekognition.compareFaces(params).promise();
        return result.FaceMatches[0].Similarity;
    } catch (err) {
        logger.error('Error comparing faces: ' + err);
        throw new Error('Failed to compare faces');
    }
};

/**
 * Main function to compare an uploaded image and a Base64-encoded image
 * @param {string} imageUrl1 - URL of the first image (uploaded to AWS S3)
 * @param {string} base64Image2 - Base64-encoded image data for the second image
 * @returns {number} Match percentage (0 to 100)
 */
export const compareImageAndBase64 = async (imageUrl1, base64Image2) => {
    try {
        // Step 1: Download the first image from AWS S3
        const image1Base64 = await downloadImageFromS3(imageUrl1, 'profile');

        // Step 2: Detect face and get face ID for Image 1 (Base64)
        const faceId1 = await getFaceIdFromBase64(image1Base64);

        // Step 3: Detect face and get face ID for Image 2 (Base64)
        const faceId2 = await getFaceIdFromBase64(base64Image2);

        // Step 4: Compare faces and get match percentage
        const matchPercentage = await compareFaces(faceId1, faceId2);

        return matchPercentage;
    } catch (err) {
        logger.error('Error comparing images: ' + err);
        throw new Error('Failed to compare images');
    }
};
