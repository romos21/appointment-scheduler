import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1711053995199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  
    `);
    await queryRunner.query(`
      CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR NOT NULL,
        last_name VARCHAR NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        phone_number VARCHAR UNIQUE NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp" RESTRICT`);
  }
}
