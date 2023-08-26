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
const password_1 = require("../password");
const bcrypt_1 = __importDefault(require("bcrypt"));
jest.mock('bcrypt');
bcrypt_1.default.genSalt = jest.fn().mockReturnValue('salt');
bcrypt_1.default.hash = jest.fn().mockReturnValue('password hashed');
bcrypt_1.default.compare = jest.fn((password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (password === 'password' && hashPassword === 'password hashed') {
        return true;
    }
    else {
        return false;
    }
}));
describe('Password', () => {
    it('returns a hashed password', () => __awaiter(void 0, void 0, void 0, function* () {
        const hashedPassword = yield (0, password_1.hashPassword)('password');
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toEqual('password');
        expect(hashedPassword).toEqual('password hashed');
    }));
    it('returns true when password is compared to real hash', () => __awaiter(void 0, void 0, void 0, function* () {
        const isMatch = yield (0, password_1.comparePassword)('password', 'password hashed');
        expect(isMatch).toBeTruthy();
    }));
    it('returns false when password is compared to fake hash', () => __awaiter(void 0, void 0, void 0, function* () {
        const isMatch = yield (0, password_1.comparePassword)('password', 'passwordnothashed');
        expect(isMatch).toBeFalsy();
    }));
    it('returns false when invalid password is compared to real hash', () => __awaiter(void 0, void 0, void 0, function* () {
        const isMatch = yield (0, password_1.comparePassword)('password123', 'password hashed');
        expect(isMatch).toBeFalsy();
    }));
});
