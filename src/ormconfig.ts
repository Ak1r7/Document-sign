import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';

dotenv.config();
if (!process.env.DB_PORT) {
  throw new Error("DB_PORT is not defined in environment variables.");
}
 
export const ormconfig: PostgresConnectionOptions = {
  type: process.env.DB_TYPE as 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/**/migrations/**/*{.ts,.js}`],
  synchronize: false,
};

export const AppDataSource = new DataSource(ormconfig);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

