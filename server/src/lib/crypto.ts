import crypto from 'node:crypto';

export const createOpaqueToken = () => crypto.randomBytes(24).toString('hex');

export const sha256Hex = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

