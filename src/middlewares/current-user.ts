import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../errors/not-authorized-error';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // const bearer = req.headers.authorization;
  if (!req.headers || !req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    throw new NotAuthorizedError();
  }

  const bearer = req.headers.authorization;
  const token = bearer.split(' ')[1].trim();

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_KEY!
    ) as UserPayload;
    req.user = payload;
  } catch (err) {
    console.log(err);
  }

  next();
};
