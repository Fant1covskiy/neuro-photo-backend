import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StylesService } from './styles.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';
import { cloudinaryStorage } from '../../config/cloudinary.config';

@Controller('styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Get()
  findAll(
    @Query('category_id') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      category_id: categoryId ? parseInt(categoryId) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };
    return this.stylesService.findAll(filters);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.stylesService.search(query);
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.stylesService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.findOne(id);
  }

  @Post('admin')
  create(@Body() createStyleDto: CreateStyleDto) {
    return this.stylesService.create(createStyleDto);
  }

  @Put('admin/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStyleDto: UpdateStyleDto,
  ) {
    return this.stylesService.update(id, updateStyleDto);
  }

  @Post('admin/:id/preview')
  @UseInterceptors(
    FileInterceptor('preview', {
      storage: cloudinaryStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPreview(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = (file as any).path;
    return this.stylesService.addPreviewImage(id, url);
  }

  @Post('admin/:id/preview/multiple')
  @UseInterceptors(
    FilesInterceptor('previews', 5, {
      storage: cloudinaryStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPreviewMultiple(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = files.map((file: any) => file.path);
    return Promise.all(urls.map((url) => this.stylesService.addPreviewImage(id, url))).then(
      () => this.stylesService.findOne(id),
    );
  }

  @Patch('admin/:id/toggle')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.toggleActive(id);
  }

  @Delete('admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.remove(id);
  }
}
