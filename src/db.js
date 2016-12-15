'use strict'

const firebase = require("firebase")
const cfg = require('../config')

firebase.initializeApp(cfg.firebase)

module.exports = {
    getStickersByTags,
    getUserStickers,
    getStickerTags,
    saveTags,
    deleteSticker
}

function getStickersByTags(userId, filterTags) {
    return firebaseSignIn()
        .then(getData)
        .then(onSuccess)
        .catch(onError)

    function getData() {
        return firebase.database().ref(userId)
            .limitToFirst(30)
            .once('value')
    }

    function onSuccess(snapshot) {
        const data = snapshot.val()

        let stickerIds = []

        data && Object.keys(data).forEach(key => {
            let tags = data[key]

            if (isEmptyTagQuery(filterTags) || isTagContained(filterTags, tags)) {
                stickerIds.push(key)
            }
        })

        return Promise.resolve(stickerIds)
    }

    function isEmptyTagQuery(filterTags) {
        return filterTags.length === 1 && filterTags[0] === ''
    }

    function isTagContained(filterTags, tags) {
        return filterTags.every(val => ~tags.indexOf(val.toLocaleLowerCase()))
    }
}

function getUserStickers(userId) {
    return firebaseSignIn()
        .then(getData)
        .then(onSuccess)
        .catch(onError)

    function getData() {
        return firebase.database().ref(userId).once('value')
    }

    function onSuccess(snapshot) {
        return Promise.resolve(snapshot.val())
    }
}

function getStickerTags(userId, stickerId) {
    return firebaseSignIn()
        .then(getData)
        .then(onSuccess)
        .catch(onError)

    function getData() {
        return firebase.database().ref([userId, stickerId].join('/')).once('value')
    }

    function onSuccess(snapshot) {
        return Promise.resolve(snapshot.val())
    }
}

function saveTags(userId, stickerId, tags) {
    return firebaseSignIn()
        .then(saveData)
        .then(onSuccess)
        .catch(onError)

    function saveData() {
        return firebase.database().ref([userId, stickerId].join('/')).set(tags)
    }

    function onSuccess() {}
}

function deleteSticker(userId, stickerId) {
    return firebaseSignIn()
        .then(deleteData)
        .then(onSuccess)
        .catch(onError)

    function deleteData() {
        return firebase.database().ref([userId, stickerId].join('/')).remove()
    }

    function onSuccess() {}
}

function firebaseSignIn() {
    return firebase.auth().signInAnonymously()
}

function onError(err) {
    console.error('Error', err)
}
