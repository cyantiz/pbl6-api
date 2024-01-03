import { Bucket } from '@google-cloud/storage';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FirebaseService {
  private readonly firebaseAdmin: App;
  private readonly storageBucket: Bucket;

  constructor(private config: ConfigService) {
    const bucketName = config.get('firebase.storageBucketName');

    this.firebaseAdmin = initializeApp();
    this.storageBucket = getStorage().bucket(bucketName);
  }

  private log(message?: any, ...optionalParams: any[]) {
    return console.log('*** Firebase Module ***', message, ...optionalParams);
  }

  async uploadFile(params: {
    buffer: Buffer;
    folder?: string;
    fileName?: string;
    overrideFileName?: string;
  }) {
    let { fileName = `FILE${uuidv4()}${Date.now()}.jpg` } = params;
    const { buffer, folder = '', overrideFileName } = params;

    try {
      if (overrideFileName) {
        const extension = fileName.split('.').pop();
        fileName = `${overrideFileName}.${extension}`;
      }
      const file = this.storageBucket.file(`${folder}/${fileName}`);

      await file.save(buffer);

      return { file, fileName };
    } catch (error) {
      this.log('Error while uploading file to Firebase Storage', error);

      throw new InternalServerErrorException(
        'Error while uploading file to Firebase Storage',
      );
    }
  }
}
