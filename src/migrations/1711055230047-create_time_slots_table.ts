import { MigrationInterface, QueryRunner } from 'typeorm';
import { COMMUTE_METHOD_TYPES, TIME_SLOT_TYPES } from '../common/constants';

export class CreateTimeSlotsTable1711055230047 implements MigrationInterface {
  private parseTypes(enumItem) {
    return `(${Object.values(enumItem)
      .map((item: string) => `'${item}'`)
      .join(', ')})`;
  }

  get timeSlotTypes() {
    return this.parseTypes(TIME_SLOT_TYPES);
  }

  get commuteMethodTypes() {
    return this.parseTypes(COMMUTE_METHOD_TYPES);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE time_slot_type AS ENUM ${this.timeSlotTypes}`,
    );
    await queryRunner.query(
      `CREATE TYPE time_slot_commute_method_type AS ENUM ${this.commuteMethodTypes}`,
    );
    await queryRunner.query(`
      CREATE TABLE time_slots (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        type time_slot_type,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        recurring_rule VARCHAR DEFAULT NULL,
        commute_method time_slot_commute_method_type
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS time_slots CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS time_slot_type`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS time_slot_commute_method_type`,
    );
  }
}
