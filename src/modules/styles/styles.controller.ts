import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { StylesService } from './styles.service';
import { CreateStyleDto } from './dto/create-style.dto';
import { UpdateStyleDto } from './dto/update-style.dto';

@Controller('styles')
export class StylesController {
  constructor(private readonly stylesService: StylesService) {}

  @Get()
  findAll(@Query('category_id') categoryId?: string, @Query('limit') limit?: string) {
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

  @Patch('admin/:id/toggle')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.toggleActive(id);
  }

  @Delete('admin/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stylesService.remove(id);
  }
}
