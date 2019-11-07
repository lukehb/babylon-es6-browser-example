//imports
import { createRequire } from 'module';
import * as path from 'path';

//old node-style imports
const require = createRequire(import.meta.url);
var express = require('express');

const PORT = (process.env.PORT === undefined) ? 3000 : process.env.PORT;
const HOST = 'localhost';

//express setup
var app = express();

//to read json body
app.use(express.json());

const __dirname = path.resolve();

//for serving gzipped js
app.get('*.js.gz', function(req, res, next) {
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', 'text/javascript');
  next();
});

app.use('/', express.static(path.join(__dirname, '/')));

console.log("Server root: " + __dirname);

//start server listening
app.listen(PORT, () => console.log(`Running on: http://${HOST}:${PORT}`))