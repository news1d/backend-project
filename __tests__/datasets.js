"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataset1 = exports.video3 = exports.video2 = exports.video1 = void 0;
// import {VideoDBType} from '../src/db/video-db-type'
const video_types_1 = require("../src/input-output-types/video-types");
// готовые данные для переиспользования в тестах
exports.video1 /*VideoDBType*/ = {
    id: Date.now() + Math.random(),
    title: 't' + Date.now() + Math.random(),
    author: 'a' + Date.now() + Math.random(),
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: new Date().toISOString(),
    publicationDate: new Date().toISOString(),
    availableResolution: [video_types_1.Resolutions.P240],
};
exports.video2 /*VideoDBType*/ = {
    id: Date.now() + Math.random(),
    title: 't' + Date.now() + Math.random(),
    author: 'a' + Date.now() + Math.random(),
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: new Date().toISOString(),
    publicationDate: new Date().toISOString(),
    availableResolution: [video_types_1.Resolutions.P240],
};
exports.video3 /*VideoDBType*/ = {
    id: Date.now() + Math.random(),
    title: 't' + Date.now() + Math.random(),
    author: 'a' + Date.now() + Math.random(),
    canBeDownloaded: true,
    minAgeRestriction: null,
    createdAt: new Date().toISOString(),
    publicationDate: new Date().toISOString(),
    availableResolution: [video_types_1.Resolutions.P240],
};
// ...
exports.dataset1 = {
    videos: [exports.video1, exports.video2, exports.video3],
};
// ...
