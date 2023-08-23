import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const upload = multer({
	dest: 'files',
	limits: {
		fileSize: 200 * 1024 * 1024, // 200MB in bytes
	},
}).single('file');

export const multerMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	upload(req, res, function (err) {
		if (err) {
			return res.status(400).json({
        errors: [
          {
            message: err.message
          }
        ]
      })
		}
		// console.log(req.file);
    next();
	});
};
