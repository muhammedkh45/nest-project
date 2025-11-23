import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import multer from 'multer';

export const multerlocal = ({ fileType = [] }: { fileType?: string[] }) => {
  return {
    storage: multer.diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, './uploads');
      },
      filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, Date.now + file.originalname);
      },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
      if (fileType.includes(file.mimetype)) {
        cb(null, true);
      }
      cb(new BadRequestException('Invalid file type'), false);
    },
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
  };
};
