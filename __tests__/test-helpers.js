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
exports.videosTestManager = void 0;
const app_1 = require("../src/app");
const supertest_1 = __importDefault(require("supertest"));
const settings_1 = require("../src/settings");
const http_statuses_1 = require("../src/http-statuses");
exports.videosTestManager = {
    createVideo(data, statusCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.app)
                .post(settings_1.SETTINGS.PATH.VIDEOS)
                .send(data)
                .expect(http_statuses_1.HTTP_STATUSES.CREATED_201);
            const createdVideo = response.body;
            expect(createdVideo).toEqual({
                id: expect.any(Number),
                title: createdVideo.title,
                author: createdVideo.author,
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: expect.any(String),
                publicationDate: expect.any(String),
                availableResolutions: data.availableResolutions || null
            });
            // Проверка, что publicationDate = createdAt + 1 день
            const createdAtTimestamp = Date.parse(createdVideo.createdAt); // Преобразуем createdAt в миллисекунды
            const publicationDateTimestamp = Date.parse(createdVideo.publicationDate); // Преобразуем publicationDate в миллисекунды
            expect(publicationDateTimestamp).toBe(createdAtTimestamp + 86400000); // 86400000 миллисекунд = 1 день
            return response;
        });
    },
    updateVideo(data, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, supertest_1.default)(app_1.app)
                .put(`${settings_1.SETTINGS.PATH.VIDEOS}/${id}`)
                .send(data)
                .expect(http_statuses_1.HTTP_STATUSES.NO_CONTENT_204);
        });
    }
};
