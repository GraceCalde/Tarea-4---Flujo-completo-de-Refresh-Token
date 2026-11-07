import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .refine(
        (password) => Buffer.byteLength(password, 'utf8') <= 72,
        'La contraseña no puede superar los 72 bytes'
    );

export const registroSchema = z.object({
    email: z
        .string()
        .trim()
        .email('El correo electrónico no es válido')
        .transform((email) => email.toLowerCase()),

    password: passwordSchema
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('El correo electrónico no es válido')
        .transform((email) => email.toLowerCase()),

    password: z.string().min(1, 'La contraseña es obligatoria')
});

export const refreshSchema = z.object({
    refreshToken: z
        .string()
        .regex(
            /^[A-Za-z0-9_-]{86}$/,
            'El formato del Refresh Token no es válido'
        )
});