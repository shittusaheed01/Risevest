import { Request, Response, NextFunction } from 'express';

import { currentUser } from '../current-user';
import { NotAuthorizedError } from '../../errors/not-authorized-error';

describe('current-user middleware', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

	it('throws an error with no headers', async () => {
		const expectedResponse = {
			errors: [
				{
					message: 'Not authorized',
				},
			],
		};

    expect( () => currentUser(mockRequest as Request, mockResponse as Response, nextFunction)).toThrowError(NotAuthorizedError);
	});

  it('throws an error with no authorization headers', async () => {

    mockRequest.headers = {};

    expect( () => currentUser(mockRequest as Request, mockResponse as Response, nextFunction)).toThrowError(NotAuthorizedError);
	});

  it('calls the next function', async () => {
    mockRequest = {
      headers: {
        authorization:"Bearer 1234",
      }
    };

    await currentUser(mockRequest as Request, mockResponse as Response, nextFunction)
    expect(nextFunction).toHaveBeenCalled();
	});
});
