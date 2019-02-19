const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: './data/lambda.sqlite3',
  },
  useNullAsDefault: true,
}

const db = knex(knexConfig);

const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

// GET All Zoos
server.get('/api/zoos', async (req, res) => {
  try{
    const zoos = await db('zoos');
    res.status(200).json(zoos);
  } catch(error){
    res.status(500).json(error);
  }
});

// GET Zoo by ID
server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoo = await db('zoos')
    .where({ id: req.params.id })
    .first();
  res.status(200).json(zoo);
  } catch(error) {
    res.status(500).json(error);
  }
});

const errors = {
  '19': 'Another zoo with that value exists',
}

// Create a Zoo
server.post('/api/zoos', async (req, res) => {
  try{
    const [id] = await db('zoos').insert(req.body);

    const zoo = await db('zoos').
      where({ id })
      .first();
    res.status(201).json(zoo);

  } catch(error) {
    const message = errors[errors.errno] || 'We ran into an error adding this to our database';
    res.status(500).json({ message, error });
  }
})

// Update Zoo by ID
server.put('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .update(req.body);
    
      if (count > 0){
        const zoo = await db('zoos')
          .where({ id: req.params.id })
          .first();
        res.status(200).json(zoo);
      } else {
        res.status(404).json({ message: 'Zoo not found to update '});
      }
  } catch(error){
    res.status(500).json(error);
  }
})

const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
