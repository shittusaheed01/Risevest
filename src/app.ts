import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';

import { signinRouter } from './routes/signin';
import { liveRouter } from './routes/live';
import { folderRouter } from './routes/folder';
import { fileRouter } from './routes/file';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.use(liveRouter);
app.use(signupRouter);
app.use(signinRouter);
app.use(folderRouter);
app.use(fileRouter);
// app.use(signoutRouter);


app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
