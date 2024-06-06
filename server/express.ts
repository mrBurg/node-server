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
  .get('/', (req, res) =>
    res.render('index', { title: 'Index page', content: req.url })
  )
  .get('/flex', (req, res) =>
    res.render('flex', { title: 'Flex page', content: req.url })
  )
  .get('/db', async (_req, res) =>
    res.send(
      await db_query(`
        SELECT * FROM public.game
        ORDER BY ga_id ASC
      `)
    )
  )
  .use('/not-found', (req, res) =>
    res.status(300).render('index', {
      title: 'Not found',
      url: req.url,
      pageStatus: 300,
    })
  )
  .use('/redirect', (_req, res) => res.redirect(301, '/'))
  // TODO https://wanago.io/2019/03/25/node-js-typescript-7-creating-a-server-and-receiving-requests/
  .use('/upload', (_req, _res, next) => next())
  .use((_req, res) =>
    res.status(404).format({
      html: () => res.render('404'),
      json: () => res.json({ error: 'Not found' }),
      default: () => res.type('txt').send('Not found'),
    })
  );
/* .listen(PORT, () =>
    console.log(
      `\x1b[92m${PROTOCOL} App ready on =>\n  host -> [\x1b[102m\x1b[30m ${HOSTNAME} \x1b[0m\x1b[92m]\n  port -> :[\x1b[102m\x1b[30m ${PORT} \x1b[0m\x1b[92m]\n\x1b[0m`
    )
  ); */

http.createServer(app).listen(HTTP_PORT, serverCallback('http', HTTP_PORT));

https
  .createServer(credentials, app)
  .listen(HTTPS_PORT, serverCallback('https', HTTPS_PORT));
