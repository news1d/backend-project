import {app} from '../src/app'
import request from 'supertest'
import {SETTINGS} from "../src/settings";
import {HTTP_STATUSES, HttpStatusType} from "../src/http-statuses";
import {CreateVideoInputModel, UpdateVideoInputModel} from "../src/input-output-types/video-types";


export const videosTestManager = {
    async createVideo(data: CreateVideoInputModel, statusCode?: HttpStatusType) {
        const response =  await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201);

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
        })

        // Проверка, что publicationDate = createdAt + 1 день
        const createdAtTimestamp = Date.parse(createdVideo.createdAt); // Преобразуем createdAt в миллисекунды
        const publicationDateTimestamp = Date.parse(createdVideo.publicationDate); // Преобразуем publicationDate в миллисекунды

        expect(publicationDateTimestamp).toBe(createdAtTimestamp + 86400000); // 86400000 миллисекунд = 1 день

        return response;
    },

    async updateVideo(data: UpdateVideoInputModel, id: string) {
        return await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${id}`)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    }
}