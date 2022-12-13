const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const package = require('./package.json');

const port = process.env.PORT || 5000;
const apiRoot = '/api';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: /http:\/\/localhost/
}));
app.options('*', cors());

// our sample "database"
const db = {
  yohan: {
    user: 'yohan',
    currency: '$',
    description: `Yohan's account`,
    balance: 100,
    transactions: []
  }
};

// configure routes
const router = express.Router();
router.get('/', (req, res) => {
  res.send(`${package.name} - v${package.version}`);
});

router.get('/accounts/:user', (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res
      .status(404)
      .json({ error: 'User does not exist' });
  }

  return res.json(account);
});

router.post('/accounts', (req, res) => {
  const body = req.body;

  // validate required values
  if (!body.user || !body.currency) {
    return res
      .status(400)
      .json({ error: 'user and currency are required' });
  }

    // check account does not exists
    if (db[body.user]) {
      return res
        .status(400)
        .json({ error: 'Account already exists' });
    }

    let balance = body.balance;
    if (balance && typeof(balance) !== 'number') {
      balance = parseFloat(balance);
      if (Number.isNaN(balance)) {
        return res
          .status(400)
          .json({ error: 'balance must be a number' });
      }
    }

  // now we can create the account
  const account = {
    user: body.user,
    currency: body.currency,
    description: body.description || `${body.user}'s account`,
    balance: balance || 0,
    transactions: []
  }

  db[account.user] = account;

  // return the account
  return res
    .status(201)
    .json(account);
});

router.put('/accounts/:user', (req, res) => {
  const body = req.body;
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res
      .status(404)
      .json({ error: 'User not found' });
  }

  // validate only certain properties editable
  if (body.user || body.balance || body.transactions) {
    return res
      .status(400)
      .json({ error: 'Only currency and description can be edited' });
  }

  if (body.description) {
    account.description = body.description;
  }

  if (body.currency) {
    account.currency = body.currency;
  }

  return res.json(account);
});

router.delete('/accounts/:user', (req, res) => {
  const user = req.params.user;
  const account = db[user];

  if (!account) {
    return res
      .status(404)
      .json({ error: 'User not found' });
  }

  delete db[user];

  return res.sendStatus(204);
});

// register routes
app.use(apiRoot, router);

app.listen(port, () => {
  console.log('Server is up!');
});