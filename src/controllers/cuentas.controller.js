
const centralApi = require('../services/centralApi.service');

exports.mostrarFormulario = (req, res) => {
    res.render('cuentas', {
        titulo: 'Apertura de cuentas',
        mensaje: null,
        error: null,
        resultado: null,
        datos: {
            owner_name: '',
            initial_balance: '1000'
        }
    });
};

exports.solicitarApertura = async (req, res) => {
    const ownerName = String(req.body.owner_name || '').trim();
    const initialBalance = Number(req.body.initial_balance);

    const datos = {
        owner_name: ownerName,
        initial_balance: String(req.body.initial_balance ?? '')
    };

    const renderFormulario = (status, opciones) => {
        return res.status(status).render('cuentas', {
            titulo: 'Apertura de cuentas',
            mensaje: opciones.mensaje || null,
            error: opciones.error || null,
            resultado: opciones.resultado || null,
            datos
        });
    };

    // 1. Validar los datos recibidos del formulario.
    if (!ownerName || ownerName.length > 150) {
        return renderFormulario(400, {
            error: 'Ingresa un nombre válido de hasta 150 caracteres.'
        });
    }

    if (!Number.isFinite(initialBalance) || initialBalance !== 1000) {
        return renderFormulario(400, {
            error: 'El saldo inicial debe ser exactamente $1,000 MXN.'
        });
    }

    // 2. Comprobar que la configuración de integración exista.
    const endpoint = process.env.CENTRAL_CREATE_ACCOUNT_PATH;

    if (!endpoint) {
        return renderFormulario(503, {
            error: 'La apertura está pendiente de configurar el endpoint del Banco Central.'
        });
    }

    try {
        // 3. Enviar la solicitud al Banco Central.
        // La API central deberá adaptar estos campos a su función SQL.
        const respuesta = await centralApi.post(endpoint, {
            owner_name: ownerName,
            initial_balance: initialBalance
        });

        const cuerpo = respuesta.data;

        // 4. Interpretar la respuesta del Banco Central.
        if (cuerpo?.success === false) {
            return renderFormulario(422, {
                error: cuerpo.message ||
                    cuerpo.error ||
                    'El Banco Central rechazó la solicitud.'
            });
        }

        // 5. Mostrar la información devuelta por el Banco Central.
        return renderFormulario(200, {
            mensaje: 'Solicitud procesada por el Banco Central.',
            resultado: {
                account_number: cuerpo?.account_number,
                account_id: cuerpo?.account_id,
                balance: cuerpo?.balance
            }
        });

    } catch (error) {
        console.error(error.response?.data || error.message);
        // 6. Manejar errores sin exponer credenciales ni detalles internos.
        const status = error.response?.status;

        console.error('Error en la apertura de cuenta:', {
            status: status || null,
            mensaje: error.message
        });

        if (status === 401 || status === 403) {
            return renderFormulario(502, {
                error: 'El Banco Central no autorizó la solicitud. Revisa la configuración de autenticación.'
            });
        }

        if (status === 400 || status === 422) {
            return renderFormulario(422, {
                error: error.response?.data?.message ||
                    error.response?.data?.error ||
                    'El Banco Central rechazó los datos enviados.'
            });
        }

        if (status === 409) {
            return renderFormulario(409, {
                error: 'La operación presenta un conflicto. Revisa si la cuenta ya existe.'
            });
        }

        if (status) {
            return renderFormulario(502, {
                error: 'El Banco Central respondió con un error. Intenta nuevamente más tarde.'
            });
        }

        return renderFormulario(503, {
            error: 'No fue posible comunicarse con el Banco Central. Verifica la conexión e inténtalo más tarde.'
        });
    }
};
