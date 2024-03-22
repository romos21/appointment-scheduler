import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  synchronize: process.env.SYNCRONYZE === 'true',
  entities: [process.env.ENTITIES],
  migrations: [process.env.MIGRATIONS],
});
