import type { Request, Response } from 'express';
import path from 'node:path';

export const uploadSingle = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as { filename: string; originalname: string; mimetype: string; size: number } | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const urlPath = `/uploads/${encodeURIComponent(file.filename)}`;
    res.status(201).json({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: urlPath,
      ext: path.extname(file.filename),
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed' });
  }
};
