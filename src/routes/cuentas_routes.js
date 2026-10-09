
const express = require('express');
const router = express.Router();

const cuentasController = require('../controllers/cuentas.controller');

router.get('/', cuentasController.mostrarFormulario);
router.post('/', cuentasController.solicitarApertura);

module.exports = router;
