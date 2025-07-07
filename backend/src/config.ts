import { CookieOptions } from 'express'
import rateLimit from 'express-rate-limit'
import ms from 'ms'

type TCorsOrigin = string | undefined;
type TCorsCallback = { (error: Error | null, allowAccess: boolean): void };

export const { PORT = '3000' } = process.env
export const { DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env
export const { JWT_SECRET = 'JWT_SECRET' } = process.env
export const ACCESS_TOKEN = {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
}
export const REFRESH_TOKEN = {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || 'secret-dev',
    expiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
    cookie: {
        name: 'refreshToken',
        options: {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: ms(process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d'),
            path: '/',
        } as CookieOptions,
    },
}
export const RATE_LIMITER = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many request!',
    standardHeaders: true,
    legacyHeaders: false,
})
const whitelist = [process.env.ORIGIN_ALLOW || 'http://localhost:5173'];
export const CORS_OPTIONS = {
  origin: function(origin: TCorsOrigin, callback: TCorsCallback){
    if(typeof origin === 'string' && whitelist.includes(origin) || !origin) callback(null, true)
    else callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
}