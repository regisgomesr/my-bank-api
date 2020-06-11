import express from 'express';
import { promises } from 'fs';

const router = express.Router();

const writeFile = promises.writeFile;
const readFile = promises.readFile;


router.post('/', async (req, res) => {

  try {
    let account = req.body;
    let data = await readFile(global.fileName, 'utf8'); 
    let jsonFormatData = JSON.parse(data);

    account = { id: jsonFormatData.nextId++, ...account };
    jsonFormatData.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(jsonFormatData));

    logger.info(`POST / account - ${JSON.stringify(account)}`);
    res.end();


  } catch (err) {
    logger.error(`POST / account - ${err.message}`);
    res.status(400).send({ error: err.message });
  }

  // JSON.stringfy(params) conversao de JSON para string
  // fs.appendFile('account.json', JSON.stringify(params), err => {
  //   console.log(err);
  // });
  
});

router.get('/', async (_, res) => {

  try {
    let data = await readFile(global.fileName, 'utf8');
    let dataFormatJson = JSON.parse(data);

    delete dataFormatJson.nextId;

    logger.info(`GET / account`);
    res.send(dataFormatJson);


  } catch (error) {
    logger.error(`GET / account - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {

  try {
    let data = await readFile(global.fileName, 'utf8');
    let dataFormatJson = JSON.parse(data);

    const account = dataFormatJson.accounts.find(account => account.id === parseInt(req.params.id, 10));

    if(account) {
      res.send(account);
      logger.info(`GET / account/:id - ${JSON.stringify(account)}`);
    } else {
      logger.error(`GET / account/:id - ${err.message}`);
      res.status(400).send({ error: 'Conta não existe!' });
      res.end();
    }
      
  } catch (err) {
    logger.error(`GET / account/:id - ${err.message}`);
    res.status(400).send({ error: err.message });
  }

});

router.delete('/:id', async (req, res) => {
    
  try {
    let data = await readFile(global.fileName, 'utf8');
    let dataFormatJson = JSON.parse(data);
    let accounts = dataFormatJson.accounts.filter(account => account.id !== parseInt(req.params.id, 10));

    dataFormatJson.accounts = accounts;

    await writeFile(global.fileName, JSON.stringify(dataFormatJson));
    logger.info(`DELETE / account/:id - ${req.params.id}`);

    res.end();

  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE / account - ${err.message}`);
  }
});

router.put('/', async (req, res) => {

  try {
    let newAccount = req.body;
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let oldIndex = json.accounts.findIndex(account => account.id === newAccount.id);
    
    json.accounts[oldIndex].balance = newAccount.balance;

    await writeFile(global.fileName, JSON.stringify(json));

    logger.info(`PUT / account - ${JSON.stringify(newAccount)}`);
    res.send(json.accounts[oldIndex]);

  } catch (err) {
    logger.error(`PUT / account - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

router.post('/transaction', async (req, res) => {
  
  try {
    let newBalance = req.body;
    let data = await readFile(global.fileName, 'utf8');
    let json = JSON.parse(data);
    let index = json.accounts.findIndex(account => account.id === newBalance.id);

    if ((json.accounts[index].balance + newBalance.balance < 0) && (newBalance.balance < 0)) {
      throw new Error('Saldo insuficiente!');
    } 

    json.accounts[index].balance += newBalance.balance;

    await writeFile(global.fileName, JSON.stringify(json));

    logger.info(`POST / account/transaction - ${JSON.stringify(newBalance)}`);
    res.send(json.accounts[index]);

  } catch (err) {
    logger.error(`POST / account/transaction - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

export default router;