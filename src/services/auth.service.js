import { prisma } from '../config/prisma.js';
import { crearError } from '../factories/error.factory.js';

import {
    hashPassword,
    comparePassword
} from '../utils/password.util.js';

import {
    generarAccessToken
} from '../utils/access-token.util.js';

import {
    generarRefreshToken,
    generarTokenHash,
    generarFamilyId,
    calcularFechaExpiracion
} from '../utils/refresh-token.util.js';

export async function registrarUsuario({ email, password }) {
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (usuarioExistente) {
        throw crearError.conflict(
            'El correo electrónico ya está registrado'
        );
    }

    const passwordHash = await hashPassword(password);

    const usuario = await prisma.usuario.create({
        data: {
            email,
            passwordHash,
            rol: 1
        },
        select: {
            id_usuario: true,
            email: true,
            rol: true,
            createdAt: true
        }
    });

    return usuario;
}

export async function iniciarSesion({ email, password }) {
    const usuario = await prisma.usuario.findUnique({
        where: { email }
    });

    if (!usuario) {
        throw crearError.unauthorized('Credenciales inválidas');
    }

    const passwordCorrecta = await comparePassword(
        password,
        usuario.passwordHash
    );

    if (!passwordCorrecta) {
        throw crearError.unauthorized('Credenciales inválidas');
    }

    const accessToken = generarAccessToken(usuario);

    const refreshToken = generarRefreshToken();
    const tokenHash = generarTokenHash(refreshToken);
    const familyId = generarFamilyId();
    const expiresAt = calcularFechaExpiracion();

    await prisma.refreshToken.create({
        data: {
            id_usuario: usuario.id_usuario,
            tokenHash,
            familyId,
            expiresAt
        }
    });

    return {
        usuario: {
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            rol: usuario.rol
        },
        accessToken,
        refreshToken
    };
}

export async function renovarTokens(refreshToken) {
    const tokenHash = generarTokenHash(refreshToken);

    const resultado = await prisma.$transaction(async (tx) => {
        const tokenActual = await tx.refreshToken.findUnique({
            where: { tokenHash }
        });

        if (!tokenActual) {
            return { error: 'INVALID' };
        }

        const ahora = new Date();

        if (tokenActual.revokedAt) {
            await tx.refreshToken.updateMany({
                where: {
                    familyId: tokenActual.familyId,
                    revokedAt: null
                },
                data: { revokedAt: ahora }
            });

            return { error: 'REUSED' };
        }

        if (tokenActual.expiresAt <= ahora) {
            return { error: 'EXPIRED' };
        }

        const revocacion = await tx.refreshToken.updateMany({
            where: {
                id_refresh_token: tokenActual.id_refresh_token,
                revokedAt: null,
                expiresAt: { gt: ahora }
            },
            data: { revokedAt: ahora }
        });

        if (revocacion.count !== 1) {
            const tokenActualizado = await tx.refreshToken.findUnique({
                where: { tokenHash }
            });

            if (tokenActualizado?.revokedAt) {
                await tx.refreshToken.updateMany({
                    where: {
                        familyId: tokenActual.familyId,
                        revokedAt: null
                    },
                    data: { revokedAt: ahora }
                });

                return { error: 'REUSED' };
            }

            return { error: 'EXPIRED' };
        }

        const usuario = await tx.usuario.findUnique({
            where: {
                id_usuario: tokenActual.id_usuario
            }
        });

        if (!usuario) {
            return { error: 'USER_NOT_FOUND' };
        }

        const nuevoRefreshToken = generarRefreshToken();

        const nuevoToken = await tx.refreshToken.create({
            data: {
                id_usuario: tokenActual.id_usuario,
                tokenHash: generarTokenHash(nuevoRefreshToken),
                familyId: tokenActual.familyId,
                expiresAt: calcularFechaExpiracion()
            }
        });

        return {
            accessToken: generarAccessToken(usuario),
            refreshToken: nuevoRefreshToken,
            refreshTokenId: nuevoToken.id_refresh_token
        };
    });


    if (resultado.error === 'INVALID') {
        throw crearError.unauthorized('Refresh Token inválido');
    }

    if (resultado.error === 'REUSED') {
        throw crearError.unauthorized(
            'Refresh Token reutilizado. La sesión ha sido revocada.'
        );
    }

    if (resultado.error === 'EXPIRED') {
        throw crearError.unauthorized('Refresh Token expirado');
    }

    if (resultado.error === 'USER_NOT_FOUND') {
        throw crearError.unauthorized(
            'Usuario asociado al token no encontrado'
        );
    }

    return resultado;
}

export async function cerrarSesion(idUsuario) {
    const resultado = await prisma.refreshToken.updateMany({
        where: {
            id_usuario: idUsuario,
            revokedAt: null
        },
        data: {
            revokedAt: new Date()
        }
    });

    return {
        tokensRevocados: resultado.count
    };
}