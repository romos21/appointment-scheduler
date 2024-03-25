import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentsTable1711057442051
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE appointments (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description VARCHAR DEFAULT NULL,
        user_id uuid REFERENCES users (id) ON DELETE CASCADE,
        time_slot_id uuid REFERENCES time_slots (id) ON DELETE CASCADE,
        commute_method time_slot_commute_method_type
      );
    `);

    await queryRunner.query(`
      CREATE TABLE appointment_files (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_link VARCHAR NOT NULL,
        appointment_id uuid REFERENCES appointments (id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS appointments CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS appointment_files`);
  }
}
