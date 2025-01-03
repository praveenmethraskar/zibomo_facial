import { BlobServiceClient } from '@azure/storage-blob'
import { Readable } from 'stream'
import logger from '../logging/logger.js'
import { FaceClient } from '@azure/cognitiveservices-face'
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js'

// Azure Face API credentials
const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY
const AZURE_FACE_API_ENDPOINT = process.env.AZURE_FACE_API_ENDPOINT

// Set up Face API Client
const credentials = new CognitiveServicesCredentials(AZURE_FACE_API_KEY)
const faceClient = new FaceClient(credentials, AZURE_FACE_API_ENDPOINT)

/**
 * Detect a face from an image URL (Blob Storage) and return the face ID
 * @param {string} imageUrl - URL of the image in Azure Blob Storage
 * @returns {string} Face ID of the detected face
 */
const getFaceIdFromUrl = async (imageUrl) => {
    try {
        const detectedFaces = await faceClient.face.detectWithUrl(imageUrl, {
            returnFaceId: true,
            returnFaceLandmarks: false,
            returnFaceAttributes: ['age', 'gender'],
        })

        if (detectedFaces.length === 0) {
            throw new Error('No face detected in the image')
        }

        return detectedFaces[0].faceId // Return the first detected face ID
    } catch (err) {
        logger.error('Error detecting face from URL: ' + err)
        throw new Error('Failed to detect face from URL')
    }
}

/**
 * Detect a face from a Base64-encoded image and return the face ID
 * @param {string} base64Image - Base64-encoded image data
 * @returns {string} Face ID of the detected face
 */
const getFaceIdFromBase64 = async (base64Image) => {
    try {
        // Call the Face API to detect faces from the Base64 image
        const detectedFaces = await faceClient.face.detectWithStream(Buffer.from(base64Image, 'base64'), {
            returnFaceId: true,
            returnFaceLandmarks: false,
            returnFaceAttributes: ['age', 'gender'],
        })

        if (detectedFaces.length === 0) {
            throw new Error('No face detected in the Base64 image')
        }

        return detectedFaces[0].faceId // Return the first detected face ID
    } catch (err) {
        logger.error('Error detecting face from Base64: ' + err)
        throw new Error('Failed to detect face from Base64 image')
    }
}

/**
 * Compare two faces using their face IDs and return the match percentage
 * @param {string} faceId1 - First face ID
 * @param {string} faceId2 - Second face ID
 * @returns {number} Match percentage (0 to 100)
 */
const verifyFaces = async (faceId1, faceId2) => {
    try {
        const result = await faceClient.face.verifyFaceToFace(faceId1, faceId2)

        const matchPercentage = result.isIdentical ? 100 : result.confidence * 100
        logger.info(`Match percentage: ${matchPercentage}%`)

        return matchPercentage
    } catch (err) {
        logger.error('Error verifying faces:' + err)
        throw new Error('Failed to verify faces')
    }
}

/**
 * Main function to compare an uploaded image and a Base64-encoded image
 * @param {string} imageUrl1 - URL of the first image (uploaded to Azure Blob Storage)
 * @param {string} base64Image2 - Base64-encoded image data for the second image
 * @returns {number} Match percentage (0 to 100)
 */
export const compareImageAndBase64 = async (imageUrl1, base64Image2) => {
    try {
        // Step 1: Detect face and get face ID for Image 1 (URL)
        const faceId1 = getFaceIdFromUrl(imageUrl1)

        // Step 2: Detect face and get face ID for Image 2 (Base64)
        const faceId2 = getFaceIdFromBase64(base64Image2)

        // Step 3: Compare faces and get match percentage
        const matchPercentage = verifyFaces(faceId1, faceId2)

        return matchPercentage
    } catch (err) {
        logger.error('Error comparing images:' + err)
        throw new Error('Failed to compare images')
    }
}

export const uploadImageToAzure = async (image, orderId, type) => {
    if (!image || !orderId) {
        throw new Error('Image, orderId are required')
    }
    const AZURE_CONTAINER_NAME = `${type}-images`

    try {
        // Retrieve Azure storage credentials from environment variables
        const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME
        const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY
        // const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME

        if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY || !AZURE_CONTAINER_NAME) {
            throw new Error('Azure storage credentials are missing in environment variables')
        }

        // Create BlobServiceClient using connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
        )

        // Decode the Base64 image
        const buffer = Buffer.from(image, 'base64')

        const fileName = `${orderId}.jpg`

        // Get a reference to the container client
        const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME)

        // Create the container if it doesn't exist
        await containerClient.createIfNotExists({
            access: 'container', // Make images publicly accessible
        })

        // Create a block blob client for the uploaded image
        const blobClient = containerClient.getBlockBlobClient(fileName)

        // Upload the image to Azure Blob Storage
        await blobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: 'image/jpeg',
            },
        })

        // Generate the URL to access the uploaded image
        return { imageUrl: `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NAME}/${fileName}`, fileName }

    } catch (err) {
        logger.error('Error uploading image to Azure Blob Storage:' + err)
        throw new Error('Failed to upload image')
    }
}

export const downloadImageFromAzure = async (fileName, type) => {
    try {
        // Retrieve Azure storage credentials from environment variables
        const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME
        const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY
        const AZURE_CONTAINER_NAME = `${type}-images`

        if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY || !AZURE_CONTAINER_NAME) {
            throw new Error('Azure storage credentials are missing in environment variables')
        }

        // Create BlobServiceClient using connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
        )

        // Get a reference to the container client
        const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME)

        // Get a reference to the block blob client for the specified file
        const blobClient = containerClient.getBlockBlobClient(fileName)

        // Download the blob content as a stream
        const downloadBlockBlobResponse = await blobClient.download(0)

        // Read the stream into a buffer
        const downloadedBuffer = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)

        // Optionally, you can convert the buffer to base64 or return it directly
        const base64Image = downloadedBuffer.toString('base64') // If you need base64 encoding

        return base64Image // or return the buffer if you need the raw image data
    } catch (err) {
        logger.error('Error downloading image from Azure Blob Storage:' + err)
        throw new Error('Failed to download image')
    }
}

// Helper function to convert the readable stream into a buffer
const streamToBuffer = (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = []
        readableStream.on('data', chunk => chunks.push(chunk))
        readableStream.on('end', () => resolve(Buffer.concat(chunks)))
        readableStream.on('error', reject)
    })
}