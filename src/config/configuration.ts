export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    type: 'postgres',
    url: process.env.DB_URL,
    synchronize: process.env.SYNCHRONIZE === 'true',
    entities: [process.env.ENTITIES],
    migrations: [process.env.MIGRATIONS],
    migrationsRun: true,
  },
  fileStorage: {
    filesLimitCount: parseInt(process.env.FILES_LIMIT_COUNT) || 5,
    maxFileSize: (parseInt(process.env.MAX_FILE_SIZE) || 10) * 1024 * 1024,
    destination: process.env.FILE_STORAGE_DESTINATION,
  },
});
