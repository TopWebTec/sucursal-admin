
const express = require('express');
const router = express.Router();

const transaccionesController = require('../controllers/transacciones.controller');

router.get('/', transaccionesController.consultarHistorial);

module.exports = router;
