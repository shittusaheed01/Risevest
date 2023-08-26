import { Request, Response, NextFunction } from 'express';

import { requireAuth } from '../require-auth';
import { NotAuthorizedError } from '../../errors/not-authorized-error';

describe('current-user middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction = jest.fn();

	beforeEach(() => {
		mockRequest = {};
		mockResponse = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
		};
	});

	it('throws an error with no req.user', async () => {
		expect(() =>
			requireAuth(
				mockRequest as Request,
				mockResponse as Response,
				nextFunction
			)
		).toThrowError(NotAuthorizedError);
	});

	it('calls next with req.user attached', async () => {
		mockRequest = {
			user: {
				id: '1234',
				email: 'test',
			},
		};

		await requireAuth(
			mockRequest as Request,
			mockResponse as Response,
			nextFunction
		);

		expect(nextFunction).toHaveBeenCalled();
	});
});
