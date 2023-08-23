import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { db } from './db';

const start = async () => {
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined');
	}
	if (!process.env.PORT) {
		throw new Error('PORT must be defined');
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
