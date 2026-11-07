import { crearError } from '../factories/error.factory.js';

export function validar(schema) {
    return (req, res, next) => {
        const resultado = schema.safeParse(req.body);

        if (!resultado.success) {
            const error = crearError.badRequest(
                'Los datos enviados no son válidos'
            );

            error.details = resultado.error.issues.map((issue) => ({
                campo: issue.path.join('.'),
                mensaje: issue.message
            }));

            return next(error);
        }

        req.body = resultado.data;

        next();
    };
}