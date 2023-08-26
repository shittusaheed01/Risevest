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
Object.defineProperty(exports, "__esModule", { value: true });
const require_auth_1 = require("../require-auth");
const not_authorized_error_1 = require("../../errors/not-authorized-error");
describe('current-user middleware', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction = jest.fn();
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
    });
    it('throws an error with no req.user', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(() => (0, require_auth_1.requireAuth)(mockRequest, mockResponse, nextFunction)).toThrowError(not_authorized_error_1.NotAuthorizedError);
    }));
    it('calls next with req.user attached', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            user: {
                id: '1234',
                email: 'test',
            },
        };
        yield (0, require_auth_1.requireAuth)(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    }));
});
