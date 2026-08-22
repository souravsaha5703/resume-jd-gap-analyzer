import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION
});

export const uploadFile = async (buffer, fileKey, fileType) => {

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: fileKey,
            Body: buffer,
            ContentType: fileType
        })
    );
}

export const getImageUrl = async (fileKey) => {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileKey,
    });

    const imageUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    });

    return imageUrl;
}