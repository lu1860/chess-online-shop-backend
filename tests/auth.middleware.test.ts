/**
 * Pruebas de los middlewares de autenticación y rol.
 * No necesitan base de datos: montan una mini app de Express con los middlewares reales,
 * el middleware de errores real y un JwtService con un secreto de prueba.
 *
 * Ejecutar: npm test
 */
import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import express, { type Express } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// env.ts exige estas variables al importar; aquí se usan valores de prueba (no se conecta a ninguna base)
process.env['DATABASE_URL'] ??= 'postgresql://test:test@localhost:5432/test';
process.env['JWT_SECRET'] = 'secreto-solo-para-pruebas';
process.env['JWT_EXPIRES_IN'] = '1h';

const SECRET = 'secreto-solo-para-pruebas';
let app: Express;
let userToken: string;
let adminToken: string;

before(async () => {
  // Import dinámico: así las variables de entorno ya existen cuando se cargan los módulos
  const { createAuthenticate, soloAdmin } = await import('../src/interface/middlewares/auth.middleware.ts');
  const { errorMiddleware } = await import('../src/interface/middlewares/error.handler.ts');
  const { JwtService } = await import('../src/infrastructure/services/jwt.service.ts');

  const tokens = new JwtService(SECRET, '1h');
  const authenticate = createAuthenticate(tokens);
  userToken = tokens.generate({ id: 2, role: 'user' }).accessToken;
  adminToken = tokens.generate({ id: 1, role: 'admin' }).accessToken;

  app = express();
  app.get('/privada', authenticate, (req, res) => {
    res.json({ user: req.user });
  });
  app.delete('/productos/:id', authenticate, soloAdmin, (_req, res) => {
    res.json({ message: 'eliminado' });
  });
  app.use(errorMiddleware);
});

describe('authenticate (401)', () => {
  it('responde 401 si no llega el header Authorization', async () => {
    const res = await request(app).get('/privada');
    assert.equal(res.status, 401);
    assert.equal(typeof res.body.error, 'string');
  });

  it('responde 401 si el esquema no es Bearer', async () => {
    const res = await request(app).get('/privada').set('Authorization', `Token ${userToken}`);
    assert.equal(res.status, 401);
  });

  it('responde 401 con un token mal formado', async () => {
    const res = await request(app).get('/privada').set('Authorization', 'Bearer no-es-un-jwt');
    assert.equal(res.status, 401);
  });

  it('responde 401 con un token firmado con otro secreto', async () => {
    const forged = jwt.sign({ id: 1, role: 'admin' }, 'otro-secreto', { expiresIn: '1h' });
    const res = await request(app).get('/privada').set('Authorization', `Bearer ${forged}`);
    assert.equal(res.status, 401);
  });

  it('responde 401 con un token vencido', async () => {
    const expired = jwt.sign({ id: 2, role: 'user', exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
    const res = await request(app).get('/privada').set('Authorization', `Bearer ${expired}`);
    assert.equal(res.status, 401);
    assert.match(res.body.error, /expir/i);
  });

  it('responde 401 si el payload no tiene id y role válidos', async () => {
    const weird = jwt.sign({ id: 'uno', role: 'superadmin' }, SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/privada').set('Authorization', `Bearer ${weird}`);
    assert.equal(res.status, 401);
  });

  it('con un token válido deja { id, role } en req.user', async () => {
    const res = await request(app).get('/privada').set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.user, { id: 2, role: 'user' });
  });
});

describe('soloAdmin (403)', () => {
  it('sin token responde 401 antes de revisar el rol', async () => {
    const res = await request(app).delete('/productos/1');
    assert.equal(res.status, 401);
  });

  it('un usuario con rol user recibe 403', async () => {
    const res = await request(app).delete('/productos/1').set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
  });

  it('un admin pasa', async () => {
    const res = await request(app).delete('/productos/1').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
  });
});

describe('JwtService', () => {
  it('el payload solo lleva id, role, iat y exp (nada sensible)', async () => {
    const payload = jwt.decode(userToken) as Record<string, unknown>;
    assert.deepEqual(Object.keys(payload).sort(), ['exp', 'iat', 'id', 'role']);
  });

  it('el token tiene expiración', async () => {
    const payload = jwt.decode(userToken) as { iat: number; exp: number };
    assert.equal(payload.exp - payload.iat, 3600);
  });
});
