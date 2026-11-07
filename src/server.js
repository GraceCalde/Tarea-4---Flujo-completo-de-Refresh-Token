import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

async function iniciarServidor() {
    try {
        await prisma.$connect();

        console.log('Conexión a PostgreSQL establecida');

        app.listen(env.PORT, () => {
            console.log(
                `Servidor ejecutándose en http://localhost:${env.PORT}`
            );
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor');
        console.error(error);

        await prisma.$disconnect();

        process.exit(1);
    }
}

iniciarServidor();