const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Connexion à MongoDB
require('./db/mongoose');

// Initialisation de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration du moteur de template EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

// Middleware pour les messages flash (CORRIGÉ - sans paramètre next inutile)
app.use((req, res, next) => {
  res.locals.flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  next();
});

// Importation des routes
const productRoutes = require('./routes/productRoutes');

// Routes
app.get('/', (req, res) => {
  res.redirect('/products');
});

app.use('/products', productRoutes);

// Middleware pour les routes non trouvées (4 paramètres = erreur)
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page non trouvée',
    message: 'La page que vous recherchez n\'existe pas.' 
  });
});

// Middleware pour les erreurs (4 paramètres requis pour Express)
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).render('error', { 
    title: 'Erreur serveur',
    message: 'Une erreur est survenue sur le serveur.'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});