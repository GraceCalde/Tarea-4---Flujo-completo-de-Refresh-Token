import {
    registrarUsuario,
    iniciarSesion,
    renovarTokens
} from '../services/auth.service.js';
import { cerrarSesion } from '../services/auth.service.js';

export async function registrar(req, res, next) {
    try {
        const usuario = await registrarUsuario(req.body);

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: usuario
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const resultado = await iniciarSesion(req.body);

        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}

export async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh Token es obligatorio'
            });
        }

        const resultado = await renovarTokens(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Tokens renovados correctamente',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        const resultado = await cerrarSesion(req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada correctamente',
            data: resultado
        });
    } catch (error) {
        next(error);
    }
}