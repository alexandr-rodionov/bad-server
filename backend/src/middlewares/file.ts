import { Express, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { extname, join } from 'path'
import sanitize from 'sanitize-filename'
import sharp from 'sharp'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(
            null,
            join(
                __dirname,
                process.env.UPLOAD_PATH_TEMP
                    ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                    : '../public'
            )
        )
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const sanitizedFilename = sanitize(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const newFilename = uniqueSuffix + extname(sanitizedFilename);
        cb(null, newFilename)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileSize = {
    min: 2 * 1024,
    max: 10 * 1024 * 1024,
}

const imgMinRes = {
    width: 50,
    height: 50,
}

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(new Error(`Недопустимый тип файла. Допустимые типы: ${types.join(', ')}`));
    }

    if (file.size < fileSize.min) {
        return cb(new Error(`Размер файла слишком маленький. Минимальный размер: 2 KB`));
    }

    sharp(file.buffer)
        .metadata()
        .then((metadata) => {
            if (metadata.width != null && metadata.height != null &&
               (metadata.width < imgMinRes.width || metadata.height < imgMinRes.height)) {
                return cb(new Error(`Минимальное разрешение изображения: ${imgMinRes.width}x${imgMinRes.height}px`));
            }

            return cb(null, true);
        })
        .catch(() => {
            return cb(new Error('Ошибка анализа изображения'));
        });
}

const limits = { fileSize: fileSize.max, };

export default multer({ storage, fileFilter, limits })
