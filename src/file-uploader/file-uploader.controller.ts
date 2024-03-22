import { Controller, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Controller('file-storage')
export class FileUploaderController {
  constructor(private configService: ConfigService) {}

  @Get(':dest/:filename')
  getFile(
    @Param('dest') dest: string,
    @Param('filename') file: string,
    @Res() res,
  ) {
    return res.sendFile(file, {
      root: path.join(
        this.configService.getOrThrow('fileStorage.destination'),
        dest,
      ),
    });
  }
}
