import {Resolutions, Video} from "../input-output-types/video-types";

// типизация базы данных
export type DBType = {
    videos: Video[]
    // some: any[]
}

// создаём базу данных (пока это просто переменная)
export const db: DBType = {
    videos: [
        {
            id: +(new Date()),
            title: 'Introduction to Node.js',
            author: 'John Doe',
            canBeDownloaded: true,
            minAgeRestriction: 12,
            createdAt: new Date().toISOString(),
            publicationDate: new Date().toISOString(),
            availableResolutions: [Resolutions.P240, Resolutions.P360, Resolutions.P480, Resolutions.P720],
        },
        {
            id: +(new Date())+1,
            title: 'Advanced JavaScript',
            author: 'Jane Smith',
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: new Date().toISOString(),
            publicationDate: new Date().toISOString(),
            availableResolutions: [Resolutions.P360, Resolutions.P480, Resolutions.P720, Resolutions.P1080],
        }
    ],
}

export const clearDB = () => {
    db.videos = [];
}

export const returnAllVideos = ()=> {
    return db.videos;
}

export const addVideoToDB = (newVideo: Video) => {
    db.videos.push(newVideo);
}

export const findVideoById = (id: number) => {
    return db.videos.find(video => video.id === id);
}

export const findIndexVideoById = (id: number) => {
    return db.videos.findIndex(video => video.id === id);
}

export const deleteVideoByIndex = (index: number) => {
    db.videos.splice(index, 1);
}