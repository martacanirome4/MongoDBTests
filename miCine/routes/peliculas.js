const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);

//getPeliculas()
/*
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('peliculas')
    .find({})
    .limit(MAX_RESULTS)
    .toArray()
    .catch(err => res.status(400).send('Error al buscar películas'));
  res.json(results).status(200);
});
*/

router.get('/', async (req, res) => {
  // aqui se configura que el limite es lo que especifica el usuario
  let limit = MAX_RESULTS;
  if (req.query.limit){
    limit =  Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  // aqui se configura que la siguiente pelicula es la que sigue a la ultima que se muestra
  let next = req.query.next;
  let query = {}
  if (next){
    query = {_id: {$lt: new ObjectId(next)}}
  }
  // aqui se conecta a la base de datos
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('peliculas')
    .find(query)
    .sort({_id: -1})
    .limit(limit)
    .toArray()
    .catch(err => res.status(400).send('Error al buscar películas'));
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({results, next}).status(200);
});

//getPeliculaById()
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = {_id: new ObjectId(req.params.id)};
  let result = await dbConnect
    .collection('peliculas')
    .findOne(query);
  if (!result){
    res.send("Not found").status(404);
  } else {
    res.status(200).send(result);
  }
});

//addPelicula()
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  console.log(req.body);
  let result = await dbConnect
    .collection('peliculas')
    .insertOne(req.body);
  res.status(201).send(result);
});

//updatePeliculaById()
router.put('/:id', async (req, res) => {
  const query = {_id: new ObjectId(req.params.id)};
  const update = {$set:{
    titulo: req.body.titulo,
    descripcion: req.body.resumen,
    duracion: req.body.duracion
  }};
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('peliculas')
    .updateOne(query, update);
  res.status(200).send(result);
});

//deletePeliculaById()
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('peliculas')
    .deleteOne(query);
  res.status(200).send(result);
});

module.exports = router;
