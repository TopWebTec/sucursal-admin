const centralApi = require('../services/centralApi.service');

exports.consultarHistorial = async (req, res) => {
    const endpoint = process.env.CENTRAL_TRANSACTIONS_PATH;

    if (!endpoint) {
        return res.status(503).json({
            mensaje: 'La consulta del historial está pendiente de configurar el endpoint del Banco Central.'
        });
    }

    try {
        const respuesta = await centralApi.get(endpoint);

        return res.status(200).json({
            mensaje: 'Historial consultado correctamente.',
            datos: respuesta.data
        });

    } catch (error) {
        console.error('Error al consultar el historial:', {
            status: error.response?.status || null,
            mensaje: error.message
        });

        if (error.response) {
            return res.status(502).json({
                mensaje: 'El Banco Central respondió con un error al consultar el historial.',
                statusCentral: error.response.status
            });
        }

        return res.status(503).json({
            mensaje: 'No fue posible comunicarse con el Banco Central.'
        });
    }
};