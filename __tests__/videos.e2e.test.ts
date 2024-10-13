import request from 'supertest';
import {SETTINGS} from '../src/settings'
import {app} from "../src/app";
import {clearDB} from "../src/db/db";
import {HTTP_STATUSES} from "../src/http-statuses";
import {videosTestManager} from "./test-helpers";
import {CreateVideoInputModel, UpdateVideoInputModel} from "../src/input-output-types/video-types";

describe('/videos', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        clearDB();
    })

    it('should return 204 and empty array', async () => {
        await request(app)
            .delete(`${SETTINGS.PATH.TESTING}/all-data`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn`t create video with incorrect title data', async () => {
        // Проверка на отсутствие названия
        const data: CreateVideoInputModel = {
            title: '',
            author: 'Vadim Zeland'
        }

        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'The value is missing or the maximum allowed size has been exceeded',
                        field: 'title'
                    }
                ]
            })

        const newData: CreateVideoInputModel = {
            title: 'Transurfing reality. Stage I: Space of options',
            author: 'Vadim Zeland'
        }
        // Название превышает 40 символов
        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(newData)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "The value is missing or the maximum allowed size has been exceeded",
                        field: 'title'
                    }
                ]
            })

        // В поле названия передается null
        const dataWithNullTitle = {
            title: null,
            author: 'Vadim Zeland',
            availableResolutions: ["P144","P240","P720"]
        }

        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(dataWithNullTitle)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "The value is missing or the maximum allowed size has been exceeded",
                        field: 'title'
                    }
                ]
            })
    })

    it('shouldn`t create video with incorrect author data', async () => {
        // Проверка на отсутствие имени автора
        const data: CreateVideoInputModel = {
            title: 'Transurfing reality',
            author: ''
        }
        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "The value is missing or the maximum allowed size has been exceeded",
                        field: 'author'
                    }
                ]
            })

        // Имя автора превышает 20 символов
        const newData: CreateVideoInputModel = {
            title: 'Transurfing reality',
            author: 'Vadim Zeland Vadim Zeland'
        }
        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(newData)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "The value is missing or the maximum allowed size has been exceeded",
                        field: 'author'
                    }
                ]
            })
        })

    it('shouldn`t create video with incorrect resolutions data', async () => {
        // Передается пустой массив разрешений
        const data: CreateVideoInputModel = {
            title: 'Transurfing reality',
            author: 'Vadim Zeland',
            availableResolutions: []
        }
        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "At least one valid resolution must be added",
                        field: "availableResolutions"
                    }
                ]
            })

        // Передается массив с некорректными разрешениями
        const newData = {
            title: 'Transurfing reality',
            author: 'Vadim Zeland',
            availableResolutions: ['P140', 'P250', 'P320']
        }
        await request(app)
            .post(SETTINGS.PATH.VIDEOS)
            .send(newData)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "At least one valid resolution must be added",
                        field: "availableResolutions"
                    }
                ]
            })
    })

    it('should create video with correct data', async () => {
        // Добавление видео без массива разрешений
        const data: CreateVideoInputModel = {
            title: 'Transurfing reality',
            author: 'Vadim Zeland'
        }
         await videosTestManager.createVideo(data)

        // Добавление видео с массивом разрешений
        const newData: CreateVideoInputModel = {
            title: 'Transurfing reality',
            author: 'Vadim Zeland',
            availableResolutions: ['P144', 'P240', 'P360']
        }
        await videosTestManager.createVideo(newData)
    })

    it('should return 200 and video by id', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Martin Eden',
            author: 'Jack London'
        }
        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        await request(app)
            .get(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .expect(HTTP_STATUSES.OK_200, createdVideo)
    })

    it('should return 404 cuz id incorrect', async () => {
        await request(app)
            .get(`${SETTINGS.PATH.VIDEOS}/-1`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return 200 and empty array', async () => {
        clearDB();
        await request(app)
            .get(SETTINGS.PATH.VIDEOS)
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('shouldn`t update video with incorrect title data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Capital',
            author: 'Karl Marx'
        }
        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        // Проверка на отсутствие названия
        const dataWithoutTitle: UpdateVideoInputModel = {
            title: '',
            author: 'Karl Marx'
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithoutTitle)
            .expect(400, {
                errorsMessages: [
                    {
                        message: 'The value is missing or the maximum allowed size has been exceeded',
                        field: 'title'
                    }
                ]
            })

        // Название превышает 40 символов
        const dataWithMaxTitleSize: UpdateVideoInputModel = {
            title: 'Capital Capital Capital Capital Capital Capital',
            author: 'Karl Marx'
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithMaxTitleSize)
            .expect(400, {
                errorsMessages: [
                    {
                        message: 'The value is missing or the maximum allowed size has been exceeded',
                        field: 'title'
                    }
                ]
            })
    })

    it('shouldn`t update video with incorrect author data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Idiot',
            author: 'Fyodor Dostoevsky'
        }

        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        // Проверка на отсутствие автора
        const dataWithoutAuthor: UpdateVideoInputModel = {
            title: 'Idiot',
            author: ''
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithoutAuthor)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'The value is missing or the maximum allowed size has been exceeded',
                        field: 'author'
                    }
                ]
            })

        // Имя автора превышает 20 символов
        const dataWithMaxAuthorSize: UpdateVideoInputModel = {
            title: 'Idiot',
            author: 'Fyodor Dostoevsky Fyodor Dostoevsky'
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithMaxAuthorSize)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'The value is missing or the maximum allowed size has been exceeded',
                        field: 'author'
                    }
                ]
            })
    })

    it('shouldn`t update video with incorrect resolutions data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Alchemist',
            author: 'Paulo Coelho'
        }
        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        // Передается пустой массив разрешений
        const dataWithEmptyResolutions: UpdateVideoInputModel = {
            title: 'Alchemist',
            author: 'Paulo Coelho',
            availableResolutions: []
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithEmptyResolutions)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "At least one valid resolution must be added",
                        field: "availableResolutions"
                    }
                ]
            })

        // Передается массив с некорректными разрешениями
        const dataWithIncorrectResolutions = {
            title: 'Alchemist',
            author: 'Paulo Coelho',
            availableResolutions: ['P140', 'P250', 'P320']
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataWithIncorrectResolutions)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: "At least one valid resolution must be added",
                        field: "availableResolutions"
                    }
                ]
            })
    })

    it('shouldn`t update video with incorrect restriction data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Hamlet',
            author: 'William Shakespeare'
        }
        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        const dataForUpdate: UpdateVideoInputModel = {
            title: 'Hamlet',
            author: 'William Shakespeare',
            minAgeRestriction: 20
        }

        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataForUpdate)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'minAgeRestriction must be between 1 and 18',
                        field: 'minAgeRestriction'
                    }
                ]
            })

        const newDataForUpdate: UpdateVideoInputModel = {
            title: 'Hamlet',
            author: 'William Shakespeare',
            minAgeRestriction: 0
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(newDataForUpdate)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'minAgeRestriction must be between 1 and 18',
                        field: 'minAgeRestriction'
                    }
                ]
            })
    })

    it('shouldn`t update video with incorrect publication data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Woe from mind',
            author: 'Alexander Griboyedov'
        }
        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body
        const createdAtTimestamp = Date.parse(createdVideo.createdAt); // Преобразуем createdAt в миллисекунды
        const newPublicationDate = new Date(createdAtTimestamp - 86400000).toISOString(); // Получаем createdAt - 1

        // Вводится значение publicationDate меньшее, чем значение createdAt
        const dataForUpdate: UpdateVideoInputModel = {
            title: 'Hamlet',
            author: 'William Shakespeare',
            publicationDate: newPublicationDate
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(dataForUpdate)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
            errorsMessages: [
                {
                    message: 'publicationDate must be later than createdAt',
                    field: 'publicationDate'
                }
            ]
        })

        // Вводится неверный формат publicationDate
        const newDataForUpdate: UpdateVideoInputModel = {
            title: 'Hamlet',
            author: 'William Shakespeare',
            publicationDate: '3 may'
        }
        await request(app)
            .put(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .send(newDataForUpdate)
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {
                        message: 'Invalid publication date format',
                        field: 'publicationDate'
                    }
                ]
            })
    })

    it('should update video with correct data', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Robinzon Kruzo',
            author: 'Daniel Defo'
        }

        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body
        const createdAtTimestamp = Date.parse(createdVideo.createdAt); // Преобразуем createdAt в миллисекунды
        const newPublicationDate = new Date(createdAtTimestamp + 2*86400000).toISOString(); // Получаем createdAt + 2

        // Обновляем видео
        const dataForUpdate: UpdateVideoInputModel = {
            title: 'Robinzon Kruzo',
            author: 'Daniel Defo',
            availableResolutions: ['P360', 'P480', 'P720', 'P1080'],
            canBeDownloaded: true,
            minAgeRestriction: 7,
            publicationDate: newPublicationDate
        }
        await videosTestManager.updateVideo(dataForUpdate, createdVideo.id)

        // Вызываем обновленное видео
        await request(app)
            .get(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .expect(HTTP_STATUSES.OK_200, {
                ...createdVideo,
                canBeDownloaded: true,
                minAgeRestriction: 7,
                publicationDate: newPublicationDate,
                availableResolutions: ['P360', 'P480', 'P720', 'P1080']})
    })

    it('should delete video by id', async () => {
        // Добавляем видео
        const data: CreateVideoInputModel = {
            title: 'Chayka',
            author: 'Anton Chehov'
        }

        const createResponse = await videosTestManager.createVideo(data)

        const createdVideo = createResponse.body

        // Удаляем видео
        await request(app)
            .delete(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        // Проверяем, что видео больше не существует
        await request(app)
            .delete(`${SETTINGS.PATH.VIDEOS}/${createdVideo.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })



    // it('should get empty array', async () => {
    //     // setDB() // очистка базы данных если нужно
    //
    //     const res = await req
    //         .get(SETTINGS.PATH.VIDEOS)
    //         .expect(200) // проверяем наличие эндпоинта
    //
    //     console.log(res.body) // можно посмотреть ответ эндпоинта
    //
    //     // expect(res.body.length).toBe(0) // проверяем ответ эндпоинта
    // })
    // it('should get not empty array', async () => {
    //     // setDB(dataset1) // заполнение базы данных начальными данными если нужно
    //
    //     const res = await req
    //         .get(SETTINGS.PATH.VIDEOS)
    //         .expect(200)
    //
    //     console.log(res.body)
    //
    //     // expect(res.body.length).toBe(1)
    //     // expect(res.body[0]).toEqual(dataset1.videos[0])
    // })

    // it('should create', async () => {
    //     setDB()
    //     const newVideo: any /*InputVideoType*/ = {
    //         title: 't1',
    //         author: 'a1',
    //         availableResolution: ['P144' /*Resolutions.P144*/]
    //         // ...
    //     }
    //
    //     const res = await req
    //         .post(SETTINGS.PATH.VIDEOS)
    //         .send(newVideo) // отправка данных
    //         .expect(201)
    //
    //     console.log(res.body)
    //
    //     expect(res.body.availableResolution).toEqual(newVideo.availableResolution)
    // })
    //
    // it('shouldn\'t find', async () => {
    //     setDB(dataset1)
    //
    //     const res = await req
    //         .get(SETTINGS.PATH.VIDEOS + '/1')
    //         .expect(404) // проверка на ошибку
    //
    //     console.log(res.body)
    // })


})