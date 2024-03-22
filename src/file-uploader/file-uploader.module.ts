import { DynamicModule, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FileUploaderController } from './file-uploader.controller';
import * as path from 'path';

@Module({
  controllers: [FileUploaderController],
})
export class FileUploaderModule {
  static forFeature(destination: string): DynamicModule {
    return {
      module: FileUploaderModule,
      exports: [MulterModule],
      imports: [
        MulterModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            storage: diskStorage({
              destination: path.join(
                configService.getOrThrow('fileStorage.destination'),
                destination,
              ),
              filename: (req, file, cb) => {
                cb(
                  null,
                  `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`,
                );
              },
            }),
            limits: {
              files: configService.getOrThrow('fileStorage.filesLimitCount'),
              fileSize: configService.getOrThrow('fileStorage.maxFileSize'),
            },
          }),
        }),
      ],
    };
  }
}
