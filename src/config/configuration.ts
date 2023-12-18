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
  mongodb: {
    article: process.env.ARTICLE_MONGO_URL || '',
  },
  search: {
    host: process.env.SEARCH_HOST || '',
    port: parseInt(process.env.SEARCH_PORT, 10) || 7999,
  },
  defaultAvatar:
    'https://firebasestorage.googleapis.com/v0/b/pbl6-a7d3b.appspot.com/o/media%2Fdefault%2Fdefault.jpg?alt=media',
});
