// app.js - API REST con Express y SQLite
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 8001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para obtener todos los estudiantes o crear uno nuevo
app.route('/students')
  .get((req, res) => {
    // GET - Obtener todos los estudiantes
    db.all('SELECT * FROM students', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const students = rows.map(row => {
        return {
          id: row.id,
          firstname: row.firstname,
          lastname: row.lastname,
          gender: row.gender,
          age: row.age
        };
      });
      
      return res.json(students);
    });
  })
  .post((req, res) => {
    // POST - Crear un nuevo estudiante
    const { firstname, lastname, gender, age } = req.body;
    
    if (!firstname || !lastname || !gender) {
      return res.status(400).json({ error: 'Se requieren los campos firstname, lastname y gender' });
    }
    
    const sql = 'INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)';
    db.run(sql, [firstname, lastname, gender, age], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      return res.status(201).send(`Student with id: ${this.lastID} created successfully`);
    });
  });

// Ruta para manejar un estudiante específico (obtener, actualizar, eliminar)
app.route('/student/:id')
  .get((req, res) => {
    // GET - Obtener un estudiante por ID
    const id = req.params.id;
    
    db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!row) {
        return res.status(404).send('Something went wrong');
      }
      
      return res.json(row);
    });
  })
  .put((req, res) => {
    // PUT - Actualizar un estudiante
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    
    if (!firstname || !lastname || !gender || !age) {
      return res.status(400).json({ error: 'Se requieren todos los campos' });
    }
    
    const sql = 'UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?';
    db.run(sql, [firstname, lastname, gender, age, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'No se encontró el estudiante' });
      }
      
      const updatedStudent = {
        id: parseInt(id),
        firstname,
        lastname,
        gender,
        age
      };
      
      return res.json(updatedStudent);
    });
  })
  .delete((req, res) => {
    // DELETE - Eliminar un estudiante
    const id = req.params.id;
    
    db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'No se encontró el estudiante' });
      }
      
      return res.status(200).send(`The Student with id: ${id} has been deleted.`);
    });
  });

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor API REST escuchando en http://0.0.0.0:${PORT}`);
});