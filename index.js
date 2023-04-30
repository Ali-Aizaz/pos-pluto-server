require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const chalk = require('chalk');

const errorHandler = require('./middleware/error');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, Origin, Content-Type, Accept'
  );
  res.header('Access-Control-Expose-Headers', 'Authorization');

  next();
});

require('./routes/index')(app);

app.get('/api/v1/ip', (request, response) => response.send(request.ip));

app.use(errorHandler);

const PORT = 8080;

app.listen({ port: 8080 }, async () => {
  console.log(chalk.blue(`\nServer up on https://localhost:${PORT}\n`));
  console.log(chalk.green('\nDatabase Connected!\n'));
});
