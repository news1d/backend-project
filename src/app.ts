import express from 'express'
import cors from 'cors'
import {SETTINGS} from './settings'
import {HTTP_STATUSES} from "./http-statuses";
import {testsRouter} from "./routes/tests-router";
import {videosRouter} from "./routes/videos-router"

export const app = express() // создать приложение
app.use(express.json()) // создание свойств-объектов body и query во всех реквестах
app.use(cors()) // разрешить любым фронтам делать запросы на наш бэк

app.get('/', (req, res) => {
    // эндпоинт, который будет показывать на верселе какая версия бэкэнда сейчас залита
    res.status(HTTP_STATUSES.OK_200).json({version: '1.0'})
})

app.use(SETTINGS.PATH.TESTING, testsRouter);
app.use(SETTINGS.PATH.VIDEOS, videosRouter);