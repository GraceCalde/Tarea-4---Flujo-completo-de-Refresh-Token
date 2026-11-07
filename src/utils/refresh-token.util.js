import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function generarRefreshToken() {
    return crypto.randomBytes(64).toString('base64url');
}

export function generarTokenHash(token) {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

export function generarFamilyId() {
    return crypto.randomUUID();
}

export function calcularFechaExpiracion() {
    const dias = extraerDuracionDias(env.REFRESH_TOKEN_EXPIRES_IN);

    const fecha = new Date();

    fecha.setTime(
        fecha.getTime() + dias * 24 * 60 * 60 * 1000
    );

    return fecha;
}

function extraerDuracionDias(duracion) {
    const coincidencia = /^(\d+)d$/.exec(duracion);

    if (!coincidencia) {
        throw new Error(
            'REFRESH_TOKEN_EXPIRES_IN debe tener formato como 7d'
        );
    }

    return Number(coincidencia[1]);
}