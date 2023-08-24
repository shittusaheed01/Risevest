import express, { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { db } from '../db';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { hashPassword } from '../utils/password';

const router = express.Router();

router.post(
	'/api/users/signup',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('fullname')
			.isString()
			.trim()
      .withMessage('Full Name must be valid'),
		body('password')
			.trim()
			.isLength({ min: 4, max: 20 })
			.withMessage('Password must be between 4 and 20 characters'),
		body('role')
			.optional()
			.matches(/^(admin|user)$/)
			.withMessage('Role must be either admin or user'),
	],
	validateRequest,
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password, fullname, role = "user" } = req.body;

		try {
			const hashedPassword = await hashPassword(password);

			// Check if user exists
			const existingUser = await db.query(
				`SELECT * FROM users WHERE email = $1`,
				[email]
			);
			if (existingUser.rows.length > 0) {
				throw new BadRequestError('Email already in use');
			}

			// Create user
			const newUser = await db.query(
				`INSERT INTO users (email, password, fullname, role) VALUES ($1, $2, $3, $4) RETURNING *`,
				[email, hashedPassword, fullname, role]
			);

			const newUserObj = newUser.rows[0];

			const userJwt = jwt.sign(
				{
					id: newUserObj.id,
					email: newUserObj.email,
				},
				process.env.JWT_KEY!
			);

			res.status(201).json({
				status: 'success',
				data: {
					user: {
            id: newUserObj.id,
            email: newUserObj.email,
            fullname: newUserObj.fullname,
						role: newUserObj.role,
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

export { router as signupRouter };
