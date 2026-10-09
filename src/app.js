
require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Importar rutas
const cuentasRoutes = require('./routes/cuentas_routes');
const reportesRoutes = require('./routes/reportes_routes');
const transaccionesRoutes = require('./routes/transacciones_routes');

// Registrar rutas
app.get('/', (req, res) => {
    res.redirect('/cuentas');
});

app.use('/cuentas', cuentasRoutes);
app.use('/reportes', reportesRoutes);
app.use('/api/transacciones', transaccionesRoutes);

// Comprobación de salud
app.get('/api/salud', (req, res) => {
    res.json({
        servicio: 'Sucursal administrativa',
        estado: 'OK'
    });
});

// Manejo básico de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Error interno del servidor');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sucursal administrativa ejecutándose en puerto ${PORT}`);
});
