import {Router} from "express";
import {clearDB} from "../db/db";
import {HTTP_STATUSES} from "../http-statuses";

export const testsRouter = Router();

testsRouter.delete('/all-data', (req, res) => {
    clearDB()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

