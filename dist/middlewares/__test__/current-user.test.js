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
const current_user_1 = require("../current-user");
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
    it('throws an error with no headers', () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResponse = {
            errors: [
                {
                    message: 'Not authorized',
                },
            ],
        };
        expect(() => (0, current_user_1.currentUser)(mockRequest, mockResponse, nextFunction)).toThrowError(not_authorized_error_1.NotAuthorizedError);
    }));
    it('throws an error with no authorization headers', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest.headers = {};
        expect(() => (0, current_user_1.currentUser)(mockRequest, mockResponse, nextFunction)).toThrowError(not_authorized_error_1.NotAuthorizedError);
    }));
    it('calls the next function', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRequest = {
            headers: {
                authorization: "Bearer 1234",
            }
        };
        yield (0, current_user_1.currentUser)(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    }));
});
