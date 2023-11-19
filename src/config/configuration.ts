export default () => ({
  app: {
    env: process.env.APP_ENV || 'local',
    port: parseInt(process.env.APP_PORT, 10) || 8000,
    publicUrl: process.env.APP_PUBLIC_URL || '',
  },
  apiVersion: 'v1',
  firebase: {
    storageBucketName: process.env.FIREBASE_STORAGE_BUCKET_NAME,
  },
});
