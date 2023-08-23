import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { db } from '../db';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { multerMiddleware } from '../middlewares/multer';

const router = express.Router();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

router.get(
	'/api/file',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const folders = await db.query(
				`SELECT * FROM folders WHERE user_id = $1`,
				[req.user?.id]
			);

			const foldersObj = folders.rows;
			if (!foldersObj.length) {
				throw new BadRequestError('No folders found');
			}

			res.status(200).json({
				status: 'success',
				results: folders.rows.length,
				data: {
					folders: folders.rows,
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

router.post(
	'/api/file/upload',
	currentUser,
	requireAuth,
	multerMiddleware,
	async (req: Request, res: Response, next: NextFunction) => {
		const { name } = req.body;

		try {
			if (!req.file) {
				throw new BadRequestError('Attach a file to upload');
			}

			if (req.file.size > 99 * 1024 * 1024) {
				cloudinary.uploader.upload_large(
					req.file.path,
					{ resource_type: 'video' },
					function (err, result) {
						if (err) {
							console.log(err);
							return res.status(500).json({
								success: false,
								message: 'Error',
							});
						}

						res.status(200).json({
							success: true,
							message: 'Uploaded!',
							data: result,
						});
					}
				);
			} else {
				cloudinary.uploader.upload(req.file.path, function (err, result) {
					if (err) {
						console.log(err);
						return res.status(500).json({
							success: false,
							message: 'Error',
						});
					}

					res.status(200).json({
						success: true,
						message: 'Uploaded!',
						data: result,
					});
				});
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);
router.get(
	'/api/file/download/:fileId',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
    const { fileId } = req.params;
    const user_id = req.user?.id;

		try {
      //find file in db and make sure it belongs to the user
      //get the file url and file name from db



			// Cloudinary URL of the file you want to download
			const cloudinaryUrl = 'YOUR_CLOUDINARY_URL_HERE';

			// Set the local path where you want to save the downloaded file
			const localFilePath = path.join(__dirname, 'downloaded_file.jpg');

			axios({
				method: 'get',
				url: cloudinaryUrl,
				responseType: 'stream', // Specify the response type as stream
			})
				.then((response) => {
					// Create a writable stream to save the downloaded data
					const writer = fs.createWriteStream(localFilePath);

					// Pipe the response stream to the writer
					response.data.pipe(writer);

					// When the download is complete, handle any necessary cleanup
					writer.on('finish', () => {
						console.log('File downloaded and saved.');
					});

					// Handle errors during download
					writer.on('error', (err) => {
						console.error('Error downloading and saving file:', err);
					});
				})
				.catch((error) => {
					console.error('Error fetching Cloudinary URL:', error);
				});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

export { router as fileRouter };
