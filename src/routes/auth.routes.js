import { Router } from 'express';

import {
    registrar,
    login,
    refresh,
    logout
} from '../controllers/auth.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validate.middleware.js';

import {
    registroSchema,
    loginSchema,
    refreshSchema
} from '../validations/auth.schema.js';

const router = Router();

router.post('/register', validar(registroSchema), registrar);

router.post('/login', validar(loginSchema), login);

router.post('/refresh', validar(refreshSchema), refresh);

router.post('/logout', autenticar, logout);

router.get('/me', autenticar, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Access Token válido',
        data: {
            usuario: req.user
        }
    });
});

export default router;