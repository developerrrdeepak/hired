import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from 'zod';

const vultrConfigSchema = z.object({
  VULTR_API_KEY: z.string().min(1, 'Missing Vultr API Key'),
  VULTR_API_SECRET: z.string().min(1, 'Missing Vultr API Secret'),
  VULTR_API_ENDPOINT: z.string().url('Invalid Vultr API Endpoint'),
  VULTR_API_REGION: z.string().min(1, 'Missing Vultr API Region'),
});

export class Vultr {
  private s3Client: S3Client;

  constructor() {
    const result = vultrConfigSchema.safeParse(process.env);
    if(!result.success) {
        throw new Error(`Vultr not configured: ${result.error.flatten().fieldErrors}`);
    }

    this.s3Client = new S3Client({
      region: result.data.VULTR_API_REGION,
      endpoint: result.data.VULTR_API_ENDPOINT,
      credentials: {
        accessKeyId: result.data.VULTR_API_KEY,
        secretAccessKey: result.data.VULTR_API_SECRET,
      },
    });
  }

  async uploadFile(bucket: string, key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    });
    
    await this.s3Client.send(command);
    
    return {
        key,
        url: `${process.env.VULTR_API_ENDPOINT}/${bucket}/${key}`,
    };
  }

  async getSignedUrl(bucket: string, key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
