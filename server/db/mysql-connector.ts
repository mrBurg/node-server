import mysql from 'mysql';

import cfg from './config.json';

export default (
  query: string,
  callback: (results: unknown, fields: unknown) => void
) => {
  const db = mysql.createConnection({
    host: cfg.db.host,
    user: cfg.db.name,
    password: cfg.db.password,
    database: cfg.db.database,
  });

  db.connect((err: unknown) => {
    if (err) {
      throw err;
    }

    db.query(query, (err: unknown, results: unknown, fields: unknown) => {
      if (err) {
        throw err;
      }

      db.end(() => {
        callback(results, fields);
      });
    });
  });
};
