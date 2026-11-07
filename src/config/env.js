import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),

    JWT_ACCESS_SECRET: z
        .string()
        .min(32, 'JWT_ACCESS_SECRET debe tener al menos 32 caracteres'),

    ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),

    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d')
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
    console.error('Error en las variables de entorno:');
    console.error(resultado.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = resultado.data;