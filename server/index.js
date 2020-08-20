// This file is to run a server in localhost:3000
// Code to handle annotations is in annotationHandler.js

const opn = require('opn');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.text());
app.use('/client', express.static('client')); // For statically serving 'client' folder at '/'

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Create xfdf folder if it doesn't exist
if (!fs.existsSync('xfdf')) {
  fs.mkdirSync('xfdf');
}

// Handle POST request sent to '/server/annotationHandler.js'
app.post('/server/annotationHandler.js', (request, response) => {
  const xfdfFile = path.resolve(__dirname, `./xfdf/${request.query.documentId}.xfdf`);

  try {
    // Write XFDF string into an XFDF file
    response.status(200).send(fs.writeFileSync(xfdfFile, request.body));
  } catch (e) {
    response.status(500).send(`Error writing xfdf data to ${xfdfFile}`);
  }
  response.end();
});

// Handle GET request sent to '/server/annotationHandler.js'
app.get('/server/annotationHandler.js', (request, response) => {
  const documentId = request.query.documentId
  const xfdfFile = path.resolve(__dirname, `./xfdf/${documentId}.xfdf`);
  if (fs.existsSync(xfdfFile)) {
    response.header('Content-Type', 'text/xml');
    // Read from the XFDF file and send the string as a response
    response.status(200).send(fs.readFileSync(xfdfFile));
  } else {
    response.status(204).send(`${xfdfFile} is not found.`);
  }
  response.end();
});


// Run server
app.listen(8080, 'localhost', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`Server is listening at http://localhost:3000/client/index.html`);
    opn('http://localhost:3000/client/index.html');
  }
});