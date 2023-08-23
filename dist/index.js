"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = require("./app");
const db_1 = require("./db");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
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
        db_1.db.connect((err) => {
            //Connect to Database
            if (err) {
                console.log(err);
            }
            console.log('Connected to PG Database!');
            app_1.app.listen(process.env.PORT, () => {
                console.log(`Listening on port ${process.env.PORT}!`);
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});
start();
