import { MigrationInterface, QueryRunner } from 'typeorm';
import { TIME_SLOT_TYPES } from '../common/constants';

export class CreateTimeSlotsTable1711055230047 implements MigrationInterface {
  get timeSlotTypes() {
    return `(${Object.values(TIME_SLOT_TYPES)
      .map((item: string) => `'${item}'`)
      .join(', ')})`;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE time_slot_type AS ENUM ${this.timeSlotTypes}`,
    );
    await queryRunner.query(`
      CREATE TABLE time_slots (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        type time_slot_type,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        recurring_rule VARCHAR DEFAULT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS time_slots CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS time_slot_type`);
  }
}
