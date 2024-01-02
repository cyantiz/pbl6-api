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
    byTextUrl:
      process.env.SEARCH_BY_TEXT_URL ||
      'https://search.sportivefy.info/text-search',
    byImageUrl:
      process.env.SEARCH_BY_IMAGE_URL ||
      'https://search.sportivefy.info/image-search',
  },
  defaultAvatar:
    'https://firebasestorage.googleapis.com/v0/b/pbl6-a7d3b.appspot.com/o/media%2Fdefault%2Fdefault.jpg?alt=media',
});
