const centralApi = require('../services/centralApi.service');

exports.mostrarReportes = async (req, res) => {
    const {
        fechaInicio = '',
        fechaFin = '',
        tipo = '',
        cuenta = '',
        sucursal = ''
    } = req.query;

    const tiposValidos = ['', 'deposito', 'retiro', 'transferencia'];

    const filtros = {
        fechaInicio,
        fechaFin,
        tipo,
        cuenta,
        sucursal
    };

    const filtrosValidos =
        tiposValidos.includes(tipo) &&
        (!fechaInicio || /^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) &&
        (!fechaFin || /^\d{4}-\d{2}-\d{2}$/.test(fechaFin)) &&
        (!fechaInicio || !fechaFin || fechaInicio <= fechaFin);

    if (!filtrosValidos) {
        return res.status(400).render('reportes', {
            titulo: 'Reportes de sucursal',
            filtros,
            sucursales: [],
            transacciones: [],
            error: 'Revisa los filtros. Las fechas deben ser válidas y la inicial no puede ser posterior a la final.',
            pendiente: false
        });
    }

    try {
        const endpoint =
            process.env.CENTRAL_TRANSACTIONS_PATH ||
            '/reports/transactions';

        const respuesta = await centralApi.get(endpoint);
        const datos = respuesta.data;

        // Normalizar listado base de transacciones
        const transaccionesTotales = Array.isArray(datos)
            ? datos
            : Array.isArray(datos.data)
                ? datos.data
                : Array.isArray(datos.transactions)
                    ? datos.transactions
                    : [];

        // Extraer lista única de sucursales desde las transacciones
        const sucursales = [
            ...new Set(
                transaccionesTotales
                    .map(t => t.node_name || t.branch || t.sucursal)
                    .filter(Boolean)
            )
        ].sort();

        let transacciones = [...transaccionesTotales];

        // 1. Filtrar por sucursal
        if (sucursal) {
            transacciones = transacciones.filter(t => 
                String(t.node_name || t.branch || t.sucursal || '') === sucursal
            );
        }

        // 2. Filtrar por tipo de operación
        if (tipo) {
            transacciones = transacciones.filter(t =>
                (t.type || t.transaction_type) === tipo
            );
        }

        // 3. Filtrar por número de cuenta (Origen o Destino)
        if (cuenta.trim()) {
            const cuentaBuscada = cuenta.trim();

            transacciones = transacciones.filter(t => {
                const cuentaOrigen = t.origin_account ?? t.source_account_id ?? '';
                const cuentaDestino = t.destination_account ?? t.destination_account_id ?? '';

                return (
                    String(cuentaOrigen) === cuentaBuscada ||
                    String(cuentaDestino) === cuentaBuscada
                );
            });
        }

        // 4. Filtrar por rango de fechas
        if (fechaInicio) {
            transacciones = transacciones.filter(t =>
                (t.created_at || '').substring(0, 10) >= fechaInicio
            );
        }

        if (fechaFin) {
            transacciones = transacciones.filter(t =>
                (t.created_at || '').substring(0, 10) <= fechaFin
            );
        }

        return res.render('reportes', {
            titulo: 'Reportes de sucursal',
            filtros,
            sucursales, // Pasamos la lista única extraída de la API
            transacciones,
            error: null,
            pendiente: false
        });

    } catch (error) {
        console.error(
            'Error al obtener reporte:',
            error.response?.data || error.message
        );

        return res.status(502).render('reportes', {
            titulo: 'Reportes de sucursal',
            filtros,
            sucursales: [],
            transacciones: [],
            error: 'No fue posible cargar el historial desde el Banco Central.',
            pendiente: false
        });
    }
};