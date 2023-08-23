import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { db } from '../db';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { comparePassword } from '../utils/password';

const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 characters'),
	],
	validateRequest,
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		try {
			// Check if user exists
			const existingUser = await db.query(
				`SELECT * FROM users WHERE email = $1`,
				[email]
			);
			if (!existingUser.rows.length) {
        throw new BadRequestError(' Invalid Credentials');
			}
      const user = existingUser.rows[0];

      const isMatch = await comparePassword(password, user.password);

      if(!isMatch){
        throw new BadRequestError(' Invalid Credentials');
      }

      // Generate JWT
			const userJwt = jwt.sign(
				{
					id:user.id,
					email: user.email,
				},
				process.env.JWT_KEY!
			);

			res.status(201).json({
				status: 'success',
				data: {
					user: {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
          },
					token: userJwt,
				},
			});
		} catch (error) {
			console.log(error);
			next(error);
		}
	}
);

export { router as signinRouter };
