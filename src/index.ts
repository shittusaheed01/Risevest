import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { db } from './db';

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	// if (!process.env.PORT) {
	// 	throw new Error('PORT must be defined');
	// }
	if (!process.env.CLOUDINARY_CLOUD_NAME) {
		throw new Error('CLOUDINARY_CLOUD_NAME must be defined');
	}
	if (!process.env.CLOUDINARY_API_KEY) {
		throw new Error('CLOUDINARY_API_KEY must be defined');
	}
	if (!process.env.CLOUDINARY_SECRET_KEY) {
		throw new Error('CLOUDINARY_SECRET_KEY must be defined');
	}
	if (!process.env.CLOUDINARY_URL) {
		throw new Error('CLOUDINARY_URL must be defined');
	}
	if (!process.env.POSTGRES_URL) {
		throw new Error('POSTGRES_URL must be defined');
	}

	try {
		db.connect((err) => {
			//Connect to Database
			if (err) {
				console.log(err);
			}
			console.log('Connected to PG Database!');
      app.listen(process.env.PORT, () => {
        console.log(`Listening on port ${process.env.PORT}!`);
      });
		});
	} catch (error) {
    console.log(error);
  }
};

start();
