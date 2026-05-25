const path = require('path');
const express = require('express');

const config = require('./config');
const { getNavItems } = require('./config/navigation');
const pagesRoutes = require('./routes/pages.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler.middleware');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.locals.appName = config.appName;
app.locals.appTagline = config.appTagline;
app.locals.navItems = getNavItems();

app.use('/', pagesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
