import express from 'express';
import { promises } from 'fs';
import winston from 'winston';
import accountsRouter from './routes/accounts.js';
import swaggerUi from 'swagger-ui-express';

import { swaggerDocument } from './doc.js';

const app = express();


const writeFile = promises.writeFile;
const readFile = promises.readFile;

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.fileName = 'accounts.json';
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'my-bank-api.log' })
  ],
  format: combine(
    label({ label: 'my-bank-api' }),
    timestamp(),
    myFormat
  )
});

app.use(express.json());
app.use('/account', accountsRouter);
app.use('/doc', swaggerUi.server, swaggerUi.setup(swaggerDocument));

// app.get('/', function(req, res) {
//   res.send('Hello world!!!');
// });

app.listen(3000, async () => {

  // try {

    // callback

    // fs.readFile(global.fileName, 'utf8', (err, data) => {
    //   if(err) {
    //     const initialJson = {
    //       nextId: 1,
    //       accounts: []
    //     };
    //     fs.writeFile(global.fileName, JSON.stringify(initialJson), err => {
    //       if(err) {
    //         console.log(err);
    //       }
    //     });
    //   }
    // });

    // Promises
  //   fs.readFile(global.fileName, 'utf8').catch(() => {
  //     const initialJson = {
  //       nextId: 1,
  //       accounts: []
  //     };
  //     fs.writeFile(global.fileName, JSON.stringify(initialJson)).catch(err => {
  //       console.log(err);
  //     });
  //   });

  // } catch (err) {
  //   console.log(err);
  // }

  try {
    await readFile(global.fileName, 'utf8');
    logger.info('API Started!');

  } catch (err) {

    const initialJson = {
      nextId: 1,
      accounts: []
    };

    writeFile(global.fileName, JSON.stringify(initialJson)).catch(err => {
      logger.error(err);
    });
  }
});