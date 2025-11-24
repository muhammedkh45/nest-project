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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreatedCategoryDTO,
  getCategoriesDTO,
  UpdateCategoryDTO,
} from './dto/category.dto';
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

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  /**
   *  Create new Category
   * @param CategoryDTO
   * @param user
   * @param file
   * @returns new Category
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @UseInterceptors(
    FileInterceptor(
      'CategoryLogo',
      multerCloud({
        storeType: StoreType.memory,
        fileType: fileValidation.image,
      }),
    ),
  )
  @Post('/create')
  async createCategory(
    @Body() CategoryDTO: CreatedCategoryDTO,
    @User() user: HUserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const Category = await this.categoryService.CreateCategory(
      CategoryDTO,
      user,
      file,
    );
    return { message: 'Done', Category };
  }

  /** */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @UseInterceptors(
    FileInterceptor(
      'CategoryLogo',
      multerCloud({
        storeType: StoreType.memory,
        fileType: fileValidation.image,
      }),
    ),
  )
  @Patch('/update-image/:id')
  async updateCategoryLogo(
    @Param() id: Types.ObjectId,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
  ) {
    const Category = await this.categoryService.updateCategoryLogo(id, file);
    return { message: 'Done', Category };
  }

  /**
   *
   * @param CategoryDTO
   * @param user
   * @returns Category after update
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin],
  })
  @Patch('/update/:id')
  async updateCategory(
    @Param('id') id: Types.ObjectId,
    @Body() CategoryDTO: UpdateCategoryDTO,
  ) {
    const Category = await this.categoryService.UpdateCategory(CategoryDTO, id);
    return { message: 'Done', Category };
  }

  /**
   * Freezes a Category.
   * @param id The id of the Category to be frozen.
   * @param user The user that is freezing the Category.
   * @returns The frozen Category.
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin, RoleType.user],
  })
  @Patch('/freeze-Category/:id')
  async freezeCategory(
    @Param('id') id: Types.ObjectId,
    @User() user: HUserDocument,
  ) {
    const Category = await this.categoryService.freezeCategory(id, user);
    return { message: 'Done', Category };
  }
  /**
   * Restore/UnFreeze a Category.
   * @param id The id of the Category to be frozen.
   * @param user The user that is freezing the Category.
   * @returns The frozen Category.
   */
  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin, RoleType.user],
  })
  @Patch('/restore-Category/:id')
  async restoreCategory(
    @Param('id') id: Types.ObjectId,
    @User() user: HUserDocument,
  ) {
    const Category = await this.categoryService.restoreCategory(id);
    return { message: 'Done', Category };
  }
  /**
   * Delete a Category.
   * @param id The id of the Category to be frozen.
   * @param user The user that is freezing the Category.
   * @returns The frozen Category.
   */

  @Auth({
    tokenType: TokenType.access,
    roles: [RoleType.admin, RoleType.user],
  })
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: Types.ObjectId,
    @User() user: HUserDocument,
  ) {
    const Category = await this.categoryService.deleteCategory(id);
    return { message: 'Done', Category };
  }

  /**
   * Get all Categories.
   * @returns All Categories.
   */
  @Delete('getCategories')
  async getCategories(@Query() query: getCategoriesDTO) {
    const Categories = await this.categoryService.getCategories(query);
    return { message: 'Done', Categories };
  }
}
