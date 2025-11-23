import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { StoreType } from 'src/common/enums/multer.enum';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
  private readonly s3client: S3Client;
  constructor() {
    this.s3client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  uploadFile = async ({
    storeType = StoreType.memory,
    Bucket = process.env.AWS_BUCKET_NAME!,
    path = 'general',
    ACL = 'private' as ObjectCannedACL,
    file,
  }: {
    storeType?: StoreType;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
  }) => {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${
        randomUUID() + '_' + file.originalname
      }`,
      Body:
        storeType === StoreType.memory
          ? file.buffer
          : fs.createReadStream(file.path),
      ContentType: file.mimetype,
    });
    await this.s3client.send(command);
    if (!command.input.Key) {
      throw new BadRequestException('Failed to upload file to S3');
    }
    return command.input.Key;
  };

  uploadLargeFile = async ({
    storeType = StoreType.memory,
    Bucket = process.env.AWS_BUCKET_NAME!,
    path = 'general',
    ACL = 'private' as ObjectCannedACL,
    file,
  }: {
    storeType?: StoreType;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path: string;
    file: Express.Multer.File;
  }): Promise<string> => {
    const upload = new Upload({
      client: this.s3client,
      params: {
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${
          randomUUID() + '_' + file.originalname
        }`,
        Body:
          storeType === StoreType.memory
            ? file.buffer
            : fs.createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    upload.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });

    const { Key } = await upload.done();
    if (!Key) {
      throw new BadRequestException('Failed to upload file to S3');
    }
    return Key;
  };

  uploadFiles = async ({
    path = 'general',
    files,
    useLarge = false,
  }: {
    path: string;
    files: Express.Multer.File[];
    useLarge?: boolean;
  }) => {
    let urls: string[] = [];
    if (useLarge == true) {
      urls = await Promise.all(
        files.map((file) => this.uploadLargeFile({ file, path })),
      );
    } else {
      urls = await Promise.all(
        files.map((file) => this.uploadFile({ file, path })),
      );
    }

    return urls;
  };
  createPresignedUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    originalname,
    ContentType,
    path = 'general',
    expiresIn = 60 * 60,
  }: {
    Bucket?: string;
    originalname: string;
    ContentType: string;
    path: string;
    expiresIn?: number;
  }) => {
    const Key = `${process.env.APPLICATION_NAME}/${path}/${
      randomUUID() + '_' + originalname
    }`;
    const command = new PutObjectCommand({
      Bucket,
      Key,
      ContentType,
    });
    const url = await getSignedUrl(this.s3client, command, {
      expiresIn,
    });
    return { url, Key };
  };

  getFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }) => {
    const command = new GetObjectCommand({ Bucket, Key });
    return await this.s3client.send(command);
  };

  getFilePreSignedUrl = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
    expiresIn = 60,
    downloadName,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    downloadName?: string;
  }) => {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition: downloadName
        ? `attachment; filename="${downloadName}"`
        : undefined,
    });
    return await getSignedUrl(this.s3client, command, { expiresIn });
  };

  deleteFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }) => {
    const command = new DeleteObjectCommand({ Bucket, Key });
    return await this.s3client.send(command);
  };

  deleteFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    Keys,
    Quiet = false,
  }: {
    Bucket?: string;
    Keys: string[];
    Quiet?: boolean;
  }) => {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys.map((key) => ({ Key: key })),
        Quiet,
      },
    });
    return await this.s3client.send(command);
  };

  listFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME!,
    path,
  }: {
    Bucket?: string;
    path: string;
  }) => {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${Bucket}/${path}`,
    });
    return await this.s3client.send(command);
  };
}
