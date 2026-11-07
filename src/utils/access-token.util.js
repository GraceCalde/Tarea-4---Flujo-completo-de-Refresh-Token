import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generarAccessToken(usuario) {
    return jwt.sign(
        {
            id: usuario.id_usuario,
            rol: usuario.rol
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
        }
    );
}

export function verificarAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}