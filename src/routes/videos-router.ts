import {Response, Router} from "express";
import {
    CreateVideoInputModel,
    Resolutions,
    UpdateVideoInputModel,
    URIParamsVideoIdModel,
    Video
} from "../input-output-types/video-types";
import {HTTP_STATUSES} from "../http-statuses";
import {addVideoToDB, deleteVideoByIndex, findIndexVideoById, findVideoById, returnAllVideos} from "../db/db";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types";
import {APIErrorResult, FieldError} from "../input-output-types/output-errors-type";

export const videosRouter = Router()

videosRouter.get('/', (req, res: Response<Video[]>) => {
    res.status(HTTP_STATUSES.OK_200).json(returnAllVideos())
})

videosRouter.post('/', (req: RequestWithBody<CreateVideoInputModel>,
                                     res: Response<Video | APIErrorResult>) => {

    const errors : FieldError[] = [];

    // Проверка на наличие title и author, а также их максимальную длину
    if (!req.body.title || req.body.title.trim().length > 40) {
        errors.push({
            message: "The value is missing or the maximum allowed size has been exceeded",
            field: 'title'
        });
    }

    if (!req.body.author || req.body.author.trim().length > 20) {
        errors.push({
            message: "The value is missing or the maximum allowed size has been exceeded",
            field: 'author'
        });
    }


    if (req.body.availableResolutions !== undefined) {
        if (!Array.isArray(req.body.availableResolutions)
                || req.body.availableResolutions.length === 0
                || req.body.availableResolutions.find(p => !Resolutions[p])
        ) {
            errors.push({
                message: "At least one valid resolution must be added",
                field: "availableResolutions"
            });
        }
    }


    if (errors.length > 0) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages: errors});
        return;
    }

    // Создание нового видео
    const newVideo: Video = {
        id: +(new Date()),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date(Date.now() + 86400000).toISOString(),
        availableResolutions: req.body.availableResolutions || null
    };

    addVideoToDB(newVideo);

    res.status(HTTP_STATUSES.CREATED_201).json(newVideo);
})

videosRouter.get('/:id', (req: RequestWithParams<URIParamsVideoIdModel>, res: Response<Video>) => {

    const foundVideo = findVideoById(+req.params.id)

    if (!foundVideo) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return;
    }
    res.status(HTTP_STATUSES.OK_200).json(foundVideo)

})

videosRouter.put('/:id', (req: RequestWithParamsAndBody<URIParamsVideoIdModel, UpdateVideoInputModel>,
                                        res: Response<APIErrorResult>) => {

    const foundVideo = findVideoById(+req.params.id)

    if (!foundVideo) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return;
    }

    const errors : FieldError[] = [];

    // Проверка на наличие title и author, а также их максимальную длину
    if (!req.body.title || req.body.title.trim().length > 40) {
        errors.push({
            message: 'The value is missing or the maximum allowed size has been exceeded',
            field: 'title'
        });
    }

    if (!req.body.author || req.body.author.trim().length > 20) {
        errors.push({
            message: 'The value is missing or the maximum allowed size has been exceeded',
            field: 'author'
        });
    }

    // Если availableResolutions массив, то filter() присваивает переменной все значения, которые совпали с Resolutions, иначе null
    const availableResolutions = Array.isArray(req.body.availableResolutions)
        ? req.body.availableResolutions.filter((res: string) => Object.values(Resolutions).includes(res as Resolutions))
        : null;

    // Если availableResolutions передан, то он должно содержать хотя бы одно значение
    if (availableResolutions && availableResolutions.length === 0) {
        errors.push({
            message: 'At least one valid resolution must be added',
            field: 'availableResolutions'
        });
    }

    // Если minAgeRestriction передан, то его размер должен быть от 1 до 18
    if (typeof req.body.minAgeRestriction !== 'undefined' && req.body.minAgeRestriction !== null) {
        if (req.body.minAgeRestriction < 1 || req.body.minAgeRestriction > 18) {
            errors.push({
                message: 'minAgeRestriction must be between 1 and 18',
                field: 'minAgeRestriction'
            });
        }
    }

    // Если дата publicationDate введена
    if (req.body.publicationDate) {
        const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

        // Проверяем, соответствует ли дата заданному формату
        if (!isoDateTime.test(req.body.publicationDate)) {
            errors.push({
                message: 'Invalid publication date format',
                field: 'publicationDate'
            });
            res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages: errors });
            return;
        }

        const publicationDateTimestamp = Date.parse(req.body.publicationDate);
        const createdAtTimestamp = Date.parse(foundVideo.createdAt);

        // Проверка на то, что publicationDate позже createdAt
        if (publicationDateTimestamp <= createdAtTimestamp) {
            errors.push({
                message: 'publicationDate must be later than createdAt',
                field: 'publicationDate'
            });
        }
    }

    if (errors.length > 0) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages: errors });
        return;
    }

    foundVideo.title = req.body.title;
    foundVideo.author = req.body.author;
    // Используем новое значение, если оно передано, иначе оставляем старое
    foundVideo.canBeDownloaded = req.body.canBeDownloaded !== undefined ? req.body.canBeDownloaded : foundVideo.canBeDownloaded;
    // Если значение существует (!undefined, !null, не пустая строка и не 0), то присваиваем его, иначе оставляем то, которые было
    foundVideo.minAgeRestriction = req.body.minAgeRestriction || foundVideo.minAgeRestriction;
    foundVideo.publicationDate = req.body.publicationDate || foundVideo.publicationDate;
    foundVideo.availableResolutions = availableResolutions;

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

videosRouter.delete('/:id', (req: RequestWithParams<URIParamsVideoIdModel>, res) => {

    const foundVideoIndex = findIndexVideoById(+req.params.id);

    if (foundVideoIndex !== -1) {
        deleteVideoByIndex(foundVideoIndex);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
})