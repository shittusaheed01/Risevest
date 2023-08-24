import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { UpdateApiOptions, v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

import { db } from '../db';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';
import { multerMiddleware } from '../middlewares/multer';
import { NotAuthorizedError } from '../errors/not-authorized-error';
import e from 'express';

const router = express.Router();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

//Gets All Users Files
router.get(
	'/api/file',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const files = await db.query(
				`SELECT * FROM files WHERE user_id = $1 ORDER BY id DESC`,
				[req.user?.id]
			);

			const filesObj = files.rows;
			if (!filesObj.length) {
				throw new BadRequestError('No file found');
			}

			res.status(200).json({
				status: 'success',
				results: files.rows.length,
				data: {
					files: filesObj,
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

//Admin Gets All Users Files
router.get(
	'/api/file/admin',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const admin = await db.query(
				`SELECT role FROM users WHERE id = $1 AND role = 'admin'`,
				[req.user?.id]
			);

			const adminObj = admin.rows;
			if (!adminObj.length) {
				throw new NotAuthorizedError();
			}

			const files = await db.query(`SELECT * FROM files ORDER BY id DESC`);

			const filesObj = files.rows;
			if (!filesObj.length) {
				throw new BadRequestError('No file uploaded');
			}

			res.status(200).json({
				status: 'success',
				results: files.rows.length,
				data: {
					files: filesObj,
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

//Download File
router.get(
	'/api/file/download/:fileId',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		const { fileId } = req.params;
		const user_id = req.user?.id;

		try {
			//find file in db and make sure it belongs to the user
			const file = await db.query(
				`SELECT * FROM files WHERE user_id = $1 AND id = $2`,
				[user_id, fileId]
			);

			const filesObj = file.rows;
			if (!filesObj.length) {
				throw new BadRequestError('No file found');
			}

			//get the file url and file name from db
			const { url, name } = filesObj[0];
			const lastDotIndex = url.lastIndexOf('.');
			const ext = url.substring(lastDotIndex + 1);

			// Set the local path where you want to save the downloaded file
			const userDownloadFolder = path.join(
				require('os').homedir(),
				'Downloads',
				`${name}_${Math.floor(Math.random() * 100000)}.${ext}`
			);

			axios({
				method: 'get',
				url,
				responseType: 'stream', // Specify the response type as stream
			})
				.then((response) => {
					// Create a writable stream to save the downloaded data
					const writer = fs.createWriteStream("downloaded");

					// Pipe the response stream to the writer
					response.data.pipe(writer);

					// When the download is complete, handle any necessary cleanup
					writer.on('finish', () => {
						console.log('File downloaded and saved to Downloads folder.');
						return res.status(200).json({
							success: true,
							message: "File downloaded and saved to user's download folder.",
						});
					});

					// Handle errors during download
					writer.on('error', (err) => {
						console.error('Error downloading and saving file:', err);
						return res.status(400).json({
							errors: [
								{
									success: false,
									message: 'Error downloading and saving file',
								},
							],
						});
					});
				})
				.catch((error) => {
					console.error('Error fetching Cloudinary URL:', error);
					res.status(400).json({
						errors: [
							{
								success: false,
								message: 'Error fetching File',
							},
						],
					});
				});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

//Upload File
router.post(
	'/api/file/upload',
	currentUser,
	requireAuth,
	multerMiddleware,
	[
		body('name')
			.optional()
			.trim()
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Name must be alphanumeric and underscore only'),
	],
	validateRequest,
	async (req: Request, res: Response, next: NextFunction) => {
		const { name } = req.body;
		try {
			if (!req.file) {
				throw new BadRequestError('Attach a file to upload');
			}

			//check file type
			let resource_type: 'image' | 'video' | 'raw';
			let type: string;
			const { mimetype } = req.file;
			if (mimetype.includes('image')) {
				resource_type = 'image';
				type = 'image';
			} else if (mimetype.includes('video')) {
				resource_type = 'video';
				type = 'video';
			} else {
				resource_type = 'raw';
				type = mimetype.split('/')[0];
			}

			//upload file to cloudinary, check file size and save file to db
			if (req.file.size > 99 * 1024 * 1024) {
				console.log('large file');
				cloudinary.uploader.upload_large(
					req.file.path,
					{ resource_type, folder: 'risevest' },
					async function (err, result) {
						if (err) {
							console.log(err);
							return res.status(400).json({
								errors: [{ message: err.message }],
							});
						}
						const { secure_url: url } = result!;

						//save file to db
						const newFile = await db.query(
							`INSERT INTO files (user_id, name, url, type) VALUES ($1, $2, $3, $4) RETURNING *`,
							[
								req.user?.id,
								name ? `${name}_${Date.now()}` : `${Date.now()}`,
								url,
								type,
							]
						);

						const newFileObj = newFile.rows[0];

						return res.status(200).json({
							success: true,
							message: 'Uploaded!',
							data: {
								file: newFileObj,
							},
						});
					}
				);
			} else {
				cloudinary.uploader.upload(
					req.file.path,
					{ resource_type, folder: 'risevest' },
					async function (err, result) {
						if (err) {
							console.log(err);
							return res.status(400).json({
								errors: [{ message: err.message }],
							});
						}
						const { secure_url: url } = result!;

						//save file to db
						const newFile = await db.query(
							`INSERT INTO files (user_id, name, url, type) VALUES ($1, $2, $3, $4) RETURNING *`,
							[
								req.user?.id,
								name
									? `${name}_${new Date().getTime()}`
									: `${new Date().getTime()}`,
								url,
								type,
							]
						);

						const newFileObj = newFile.rows[0];

						return res.status(200).json({
							success: true,
							message: 'Uploaded!',
							data: {
								file: newFileObj,
							},
						});
					}
				);
			}
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

export { router as fileRouter };
