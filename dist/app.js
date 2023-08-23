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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const signin_1 = require("./routes/signin");
const live_1 = require("./routes/live");
const folder_1 = require("./routes/folder");
const file_1 = require("./routes/file");
const signup_1 = require("./routes/signup");
const error_handler_1 = require("./middlewares/error-handler");
const not_found_error_1 = require("./errors/not-found-error");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(live_1.liveRouter);
app.use(signup_1.signupRouter);
app.use(signin_1.signinRouter);
app.use(folder_1.folderRouter);
app.use(file_1.fileRouter);
// app.use(signoutRouter);
app.all('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    throw new not_found_error_1.NotFoundError();
}));
app.use(error_handler_1.errorHandler);
