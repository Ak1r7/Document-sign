import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEntity1742164842611 implements MigrationInterface {
    name = 'CreateEntity1742164842611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_logs" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "documentId" integer, CONSTRAINT "PK_8f3e4cd56af6b3bfeabf5818d28" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "path" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'uploaded', "signature" character varying, "ownerId" integer, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents_recipients_users" ("documentsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_815410aabfe0c201ba0ea80f4bf" PRIMARY KEY ("documentsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8ee907018c2156f484b5cba433" ON "documents_recipients_users" ("documentsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e15e96a6949834d0759f6ceea0" ON "documents_recipients_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "document_logs" ADD CONSTRAINT "FK_fdc2fdec7f4b64f41fd1479c105" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_logs" ADD CONSTRAINT "FK_726ad8e0b37380c94fd20177b8f" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documents_recipients_users" ADD CONSTRAINT "FK_8ee907018c2156f484b5cba4338" FOREIGN KEY ("documentsId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "documents_recipients_users" ADD CONSTRAINT "FK_e15e96a6949834d0759f6ceea0a" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents_recipients_users" DROP CONSTRAINT "FK_e15e96a6949834d0759f6ceea0a"`);
        await queryRunner.query(`ALTER TABLE "documents_recipients_users" DROP CONSTRAINT "FK_8ee907018c2156f484b5cba4338"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_4106f2a9b30c9ff2f717894a970"`);
        await queryRunner.query(`ALTER TABLE "document_logs" DROP CONSTRAINT "FK_726ad8e0b37380c94fd20177b8f"`);
        await queryRunner.query(`ALTER TABLE "document_logs" DROP CONSTRAINT "FK_fdc2fdec7f4b64f41fd1479c105"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e15e96a6949834d0759f6ceea0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ee907018c2156f484b5cba433"`);
        await queryRunner.query(`DROP TABLE "documents_recipients_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "document_logs"`);
    }

}
