import { verificarAccessToken } from '../utils/access-token.util.js';
import { crearError } from '../factories/error.factory.js';

export function autenticar(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            throw crearError.unauthorized(
                'Se requiere un token de autenticación'
            );
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            throw crearError.unauthorized(
                'El Access Token es obligatorio'
            );
        }

        const payload = verificarAccessToken(token);

        req.user = {
            id: payload.id,
            rol: payload.rol
        };

        next();
    } catch (error) {
        if (error.statusCode) {
            return next(error);
        }

        return next(
            crearError.unauthorized('Access Token inválido o expirado')
        );
    }
}