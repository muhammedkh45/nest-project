import {
  Body,
  Controller,
  Delete,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  SetMetadata,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreatedProductDTO,
  getProductsDTO,
  UpdateProductDTO,
} from './dto/product.dto';
import { TokenType } from 'src/common/enums/token.enums';
import { RoleType } from 'src/common/enums/user.enums';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import type { HUserDocument } from 'src/DB/models/user.model';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { multerCloud } from 'src/common/utils/Multer/multer.cloud';
import { StoreType } from 'src/common/enums/multer.enum';
import { fileValidation } from 'src/common/utils/Multer/multer.fileValidation';
import { Types } from 'mongoose';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  /**
   *  Create new product
   * @param productDTO
   * @param user
   * @param file
   * @returns new Product
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        {
          name: 'subImages',
          maxCount: 10,
        },
      ],
      multerCloud({
        storeType: StoreType.memory,
        fileType: fileValidation.image,
      }),
    ),
  )
  @Post('/create')
  async CreateProduct(
    @Body() productDTO: CreatedProductDTO,
    @User() user: HUserDocument,
    @UploadedFiles(ParseFilePipe)
    files: { mainImage: Express.Multer.File; subImages: Express.Multer.File[] },
  ) {
    const product = await this.productService.CreateProduct(
      productDTO,
      user,
      files,
    );
    return { message: 'Done', product };
  }
}
