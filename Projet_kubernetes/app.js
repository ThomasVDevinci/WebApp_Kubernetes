const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 5000;

// Fonction pour créer une connexion à la base de données
function createConnection() {
  const connection = mysql.createConnection({
    host: 'db',  // Utilisez 'db' si vous utilisez Docker Compose
    user: 'root',
    password: 'password',
    database: 'testdb',
  });

  connection.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err.stack);
      setTimeout(createConnection, 2000); // Réessayer après 2 secondes
    } else {
      console.log('Connecté à la base de données.');
    }
  });

  connection.on('error', (err) => {
    console.error('Erreur de connexion à la base de données:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      createConnection(); // Recréer la connexion en cas de perte de connexion
    } else {
      throw err;
    }
  });

  return connection;
}

// Créer la connexion initiale
const connection = createConnection();

// Configuration de l'application
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Route principale
app.get('/', (req, res) => {
  connection.query('SELECT * FROM items', (err, results) => {
    if (err) throw err;
    res.render('index', { items: results });
  });
});

// Ajouter une entrée
app.post('/add', (req, res) => {
  const name = req.body.name;
  connection.query('INSERT INTO items (name) VALUES (?)', [name], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Supprimer une entrée
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM items WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});