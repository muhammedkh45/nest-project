import { BadRequestException } from '@nestjs/common';
import multer from 'multer';
import os from 'os';
import { StoreType } from 'src/common/enums/multer.enum';
import { fileValidation } from './multer.fileValidation';
import { Request } from 'express';
export const multerCloud = ({
  storeType = StoreType.memory,
  fileType = fileValidation.image,
}: {
  storeType?: StoreType;
  fileType?: string[];
}) => {
  return {
    storage:
      storeType === StoreType.memory
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: os.tmpdir(),
            filename: (
              req: Request,
              file: Express.Multer.File,
              cb: Function,
            ) => {
              cb(null, `${Date.now()}-${file.originalname}`);
            },
          }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
      if (!fileType.includes(file.mimetype)) {
        cb(new BadRequestException('Invalid file type'), false);
      }
      cb(null, true);
    },
  };
};
