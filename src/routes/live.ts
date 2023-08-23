import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.get(
	'/',
	async (req: Request, res: Response, next: NextFunction) => {

		try {
			res.status(200).json({
				status: 'success',
				data: {
					message: 'Welcome to my cloud storage API',
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);
router.get(
	'/api/live',
	async (req: Request, res: Response, next: NextFunction) => {

		try {
			res.status(200).json({
				status: 'success',
				data: {
					message: 'API is Live',
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

export { router as liveRouter };
