import mysql from 'mysql';

export default (
  query: string,
  callback: (results: unknown, fields: unknown) => void
) => {
  const db = mysql.createConnection({
    host: process.env.MY_SQL_DB_HOST,
    user: process.env.MY_SQL_DB_USER,
    password: process.env.MY_SQL_DB_PASSWORD,
    database: process.env.MY_SQL_DB_NAME,
  });

  db.connect((err: unknown) => {
    if (err) {
      throw err;
    }

    db.query(query, (err: unknown, results: unknown, fields: unknown) => {
      if (err) {
        throw err;
      }

      db.end(() => callback(results, fields));
    });
  });
};
