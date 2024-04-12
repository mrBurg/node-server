// logger morgan
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import path from 'path';
import { readFileSync } from 'fs';
import ejs from 'ejs';

dotenv.config();

import { serverCallback } from './utils';
import { db_query } from './db/pg-connector';

const HTTP_PORT = Number(process.env.HTTP_PORT) || 80;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 443;
const CERTIFICATE_KEY = process.env.CERTIFICATE_KEY || '';
const CERTIFICATE_CERT = process.env.CERTIFICATE_CERT || '';
const encoding = 'utf8';

const credentials = {
  key: readFileSync(path.join(__dirname, 'certificates', CERTIFICATE_KEY), {
    encoding,
  }),
  cert: readFileSync(path.join(__dirname, 'certificates', CERTIFICATE_CERT), {
    encoding,
  }),
};

async function server(req: http.IncomingMessage, res: http.ServerResponse) {
  switch (req.url) {
    case '/favicon.ico':
      res
        .setHeader('Content-Type', 'image/x-icon')
        .end(readFileSync(path.join(__dirname, '..', 'public/favicon.ico')));

      return;

    case '/':
      res.write(
        ejs.render(
          readFileSync(path.join(__dirname, 'views', 'index.ejs'), encoding),
          { title: 'Index page' },
          { views: [path.join(__dirname, 'views')] }
        )
      );

      res.end();

      return;

    case '/flex':
      res.end(
        ejs.render(
          readFileSync(path.join(__dirname, 'views', 'flex.ejs'), encoding),
          { title: 'Flex page' },
          { views: [path.join(__dirname, 'views')] }
        )
      );

      return;

    case '/not-found':
      res.writeHead(300).end(
        ejs.render(
          readFileSync(path.join(__dirname, 'views', 'index.ejs'), encoding),
          {
            title: 'Not found',
            url: req.url,
            pageStatus: 300,
          },
          { views: [path.join(__dirname, 'views')] }
        )
      );

      return;

    case '/redirect':
      res.writeHead(301, { Location: '/' }).end();

      return;

    case '/db':
      const data = await db_query(`
        SELECT * FROM public.game
        ORDER BY ga_id ASC
      `);

      res
        .writeHead(200, { 'Content-Type': 'application/json' })
        .end(JSON.stringify(data));

      return;

    // TODO https://wanago.io/2019/03/25/node-js-typescript-7-creating-a-server-and-receiving-requests/
    case '/upload':
      if (req.method === 'POST') {
        const chunks: any = [];

        req.on('data', (chunk) => {
          chunks.push(chunk);
        });

        req.on('end', () => {
          const result = Buffer.concat(chunks).toString();
          res.end(result);
        });
      }

      return;

    default:
      if (req.url && req.url.match(/\/(css|js|img)/)) {
        res.end(readFileSync(path.join(__dirname, '..', `public${req.url}`)));

        return;
      }
  }

  res
    .writeHead(404)
    .end(
      ejs.render(
        readFileSync(path.join(__dirname, 'views', '404.ejs'), encoding),
        { title: 'Flex page' },
        { views: [path.join(__dirname, 'views')] }
      )
    );
}

http.createServer(server).listen(HTTP_PORT, serverCallback('http', HTTP_PORT));

https
  .createServer(credentials, server)
  .listen(HTTPS_PORT, serverCallback('https', HTTPS_PORT));
