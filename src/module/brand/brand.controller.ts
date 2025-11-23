import {
  Body,
  Controller,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreatedBrandDTO, UpdateBrandDTO } from './dto/brand.dto';
import { TokenType } from 'src/common/enums/token.enums';
import { RoleType } from 'src/common/enums/user.enums';
import { Auth } from 'src/common/decorators/auth.decorator';
import { User } from 'src/common/decorators';
import type { HUserDocument } from 'src/DB/models/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerCloud } from 'src/common/utils/Multer/multer.cloud';
import { StoreType } from 'src/common/enums/multer.enum';
import { fileValidation } from 'src/common/utils/Multer/multer.fileValidation';
import { Types } from 'mongoose';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  /**
   *  Create new brand
   * @param brandDTO
   * @param user
   * @param file
   * @returns new Brand
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @UseInterceptors(
    FileInterceptor(
      'BrandLogo',
      multerCloud({
        storeType: StoreType.memory,
        fileType: fileValidation.image,
      }),
    ),
  )
  @Post('/create')
  async createBrand(
    @Body() brandDTO: CreatedBrandDTO,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const brand = await this.brandService.CreateBrand(brandDTO, user, file);
    return { message: 'Done', brand };
  }

  /**
   *
   * @param brandDTO
   * @param user
   * @returns Brand after update
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @Patch('/update/:id')
  async updateBrand(
    @Param('id') id: Types.ObjectId,
    @Body() brandDTO: UpdateBrandDTO,
    @User() user: HUserDocument,
  ) {
    const brand = await this.brandService.UpdateBrand(brandDTO, user,id);
    return { message: 'Done', brand };
  }
}
