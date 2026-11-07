export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const crearError = {
    badRequest(message = 'Solicitud inválida') {
        return new AppError(message, 400, 'BAD_REQUEST');
    },

    unauthorized(message = 'No autorizado') {
        return new AppError(message, 401, 'UNAUTHORIZED');
    },

    forbidden(message = 'Acceso prohibido') {
        return new AppError(message, 403, 'FORBIDDEN');
    },

    notFound(message = 'Recurso no encontrado') {
        return new AppError(message, 404, 'NOT_FOUND');
    },

    conflict(message = 'Conflicto') {
        return new AppError(message, 409, 'CONFLICT');
    },

    internal(message = 'Error interno del servidor') {
        return new AppError(message, 500, 'INTERNAL_ERROR');
    }
};