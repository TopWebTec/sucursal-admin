
exports.mostrarReportes = (req, res) => {
    const { fechaInicio = '', fechaFin = '', tipo = '' } = req.query;

    const tiposValidos = ['', 'deposito', 'retiro', 'transferencia'];

    const filtrosValidos =
        tiposValidos.includes(tipo) &&
        (!fechaInicio || /^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) &&
        (!fechaFin || /^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) &&
        (!fechaInicio || !fechaFin || fechaInicio <= fechaFin);

    if (!filtrosValidos) {
        return res.status(400).render('reportes', {
            titulo: 'Reportes de sucursal',
            filtros: { fechaInicio, fechaFin, tipo },
            transacciones: [],
            error: 'Revisa los filtros. Las fechas deben ser válidas y la inicial no puede ser posterior a la final.',
            pendiente: true
        });
    }

    res.render('reportes', {
        titulo: 'Reportes de sucursal',
        filtros: { fechaInicio, fechaFin, tipo },
        transacciones: [],
        error: null,
        pendiente: true
    });
};
