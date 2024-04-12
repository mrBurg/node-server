// logger morgan
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import { readFileSync } from 'fs';

dotenv.config();

import { serverCallback } from './utils';
import { db_query } from './db/pg-connector';

const HTTP_PORT = Number(process.env.HTTP_PORT) || 80;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 443;
const CERTIFICATE_KEY = process.env.CERTIFICATE_KEY || '';
const CERTIFICATE_CERT = process.env.CERTIFICATE_CERT || '';

export const credentials = {
  key: readFileSync(path.join(__dirname, 'certificates', CERTIFICATE_KEY), {
    encoding: 'utf8',
  }),
  cert: readFileSync(path.join(__dirname, 'certificates', CERTIFICATE_CERT), {
    encoding: 'utf8',
  }),
};

const app = express();

app
  .set('view engine', 'ejs')
  .set('views', path.join(__dirname, 'views'))
  // .enable('verbose errors')
  .use(express.static(path.join(__dirname, '../public')))
  .use(favicon(path.join(__dirname, '../public', 'favicon.ico')))
  .get('/', (_req, res) => {
    res.render('index', { title: 'Index page' });
  })
  .get('/flex', (_req, res) => {
    res.render('flex', { title: 'Flex page' });
  })
  .get('/db', async (_req, res) => {
    const data = await db_query(`
        SELECT * FROM public.game
        ORDER BY ga_id ASC
      `);

    res.send(data);
  })
  .use((req, res) => {
    res.status(404).format({
      html: () => {
        res.render('index', {
          title: 'Not found',
          url: req.url,
          pageStatus: 404,
        });
      },
      json: () => {
        res.json({ error: 'Not found' });
      },
      default: () => {
        res.type('txt').send('Not found');
      },
    });
  });
/* .listen(PORT, () =>
    console.log(
      `\x1b[92m${PROTOCOL} App ready on =>\n  host -> [\x1b[102m\x1b[30m ${HOSTNAME} \x1b[0m\x1b[92m]\n  port -> :[\x1b[102m\x1b[30m ${PORT} \x1b[0m\x1b[92m]\n\x1b[0m`
    )
  ); */

http.createServer(app).listen(HTTP_PORT, serverCallback('http', HTTP_PORT));

https
  .createServer(credentials, app)
  .listen(HTTPS_PORT, serverCallback('https', HTTPS_PORT));
