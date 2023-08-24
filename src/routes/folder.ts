import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';

import { db } from '../db';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { currentUser } from '../middlewares/current-user';
import { requireAuth } from '../middlewares/require-auth';

const router = express.Router();

//Gets All User's Folder
router.get(
	'/api/folder',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const folders = await db.query(
				`SELECT * FROM folders WHERE user_id = $1 ORDER BY id DESC`,
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
//Gets a Single Folder
router.get(
	'/api/folder/:id',
	currentUser,
	requireAuth,
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const folders = await db.query(
				`SELECT * FROM files WHERE user_id = $1 AND folder_id = $2 ORDER BY id DESC`,
				[req.user?.id, req.params.id]
			);

			const foldersObj = folders.rows;
			if (!foldersObj.length) {
				throw new BadRequestError('No folder found');
			}

			res.status(200).json({
				status: 'success',
				results: folders.rows.length,
				data: {
					folders: folders.rows[0],
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

//Create Folder
router.post(
	'/api/folder',
	currentUser,
	requireAuth,
	[
		body('name')
      .isString()
      .trim()
      .withMessage('Folder name must be defined'),
		body('file')
			.optional()
      .isString()
			.withMessage('File ID must be defined'),
	],
	validateRequest,
	async (req: Request, res: Response, next: NextFunction) => {
    const { name, file } = req.body;

		try {
			// Check if user already created folder with same name
			const existingFolder = await db.query(
				`SELECT * FROM folders WHERE name = $1 AND user_id = $2`,
				[name, req.user?.id]
			);
			if (existingFolder.rows.length > 0) {
				throw new BadRequestError('Folder already exists, please choose another name');
			}

			// Create new folder
			const folders = await db.query(
				`INSERT INTO folders (name, user_id) VALUES ($1, $2) RETURNING *`,
				[name, req.user?.id]
			);

			res.status(200).json({
				status: 'success',
				data: {
					folders: folders.rows[0],
				}
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

//Adds File to Folder
router.post(
	'/api/folder/:id',
	currentUser,
	requireAuth,
	[
		body('file')
			.isString()
			.trim()
			.withMessage('File ID must be defined'),
	],
	validateRequest,
	async (req: Request, res: Response, next: NextFunction) => {
		const { file } = req.body;

		try {
			// Check if folder exists
			const existingFolder = await db.query(
				`SELECT * FROM folders WHERE id = $1 AND user_id = $2`,
				[req.params.id, req.user?.id]
			);
			if (!existingFolder.rows.length) {
				throw new BadRequestError('Folder does not exist');
			}

			// Check if file exists
			const existingFile = await db.query(
				`SELECT * FROM files WHERE id = $1 AND user_id = $2`,
				[file, req.user?.id]
			);
			if (!existingFile.rows.length) {
				throw new BadRequestError('File does not exist');
			}

			// Add file to folder
			const updateFile = await db.query(
				`UPDATE files SET folder_id = $1 WHERE id = $2 RETURNING *`,
				[req.params.id, file]
			);

			res.status(200).json({
				status: 'success',
				data: {
					file: updateFile.rows[0],
				}
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
)

export { router as folderRouter };
