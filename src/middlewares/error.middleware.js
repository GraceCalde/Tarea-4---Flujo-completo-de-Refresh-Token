export function manejarErrores(error, req, res, next) {
    console.error(error);

    const statusCode = error.statusCode || 500;

    const respuesta = {
        success: false,
        message: error.statusCode
            ? error.message
            : 'Error interno del servidor',
        code: error.code || 'INTERNAL_ERROR'
    };

    if (error.details) {
        respuesta.details = error.details;
    }

    return res.status(statusCode).json(respuesta);
}