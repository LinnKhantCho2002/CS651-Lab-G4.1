'use strict';
const express = require('express');
const path = require('node:path');
const app = express();
app.disable('x-powered-by');
app.get('/api/health', (req, res) => res.json({ status: 'ok', assignment: 'G4.1', hosting: 'Google App Engine' }));
app.use(express.static(path.join(__dirname, 'public')));
// Navigo uses browser history, so restaurant detail URLs must serve the app too.
app.get(['/', '/setup', '/restaurants/:id'], (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.use((req, res) => res.status(404).send('Not found'));
app.listen(process.env.PORT || 8080, '0.0.0.0', () => console.log('FriendlyEats listening on ' + (process.env.PORT || 8080)));
