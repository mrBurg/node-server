import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PG_DB_USER,
  password: process.env.PG_DB_PASSWORD,
  host: process.env.PG_DB_HOST,
  port: Number(process.env.PG_DB_PORT) || undefined,
  database: process.env.PG_DB_NAME,
});

export const db_query = async (str: string) => {
  try {
    const { rows } = await pool.query(str);

    return rows;
  } catch (err) {
    console.error(
      '\x1b[31mError executing query\x1b[0m',
      (err as Error).message
    );

    return [];
  }
};
