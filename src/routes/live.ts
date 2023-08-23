import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

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
