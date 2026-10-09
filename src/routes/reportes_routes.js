
const express = require('express');
const router = express.Router();

const reportesController = require('../controllers/reportes.controller');

router.get('/', reportesController.mostrarReportes);

module.exports = router;
