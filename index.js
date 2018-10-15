const fetch = require('node-fetch')
const url = require('url')
const path = require('path')

const trackListURL = 'https://www.ximalaya.com/revision/album/getTracksList'
const tracksURL = 'https://www.ximalaya.com/revision/play/tracks'

const pageCount = 25
const albumId = 2900377

async function main() {
    for (let currentPageNo = 0; currentPageNo < pageCount; currentPageNo++) {
        let trackIds = await getTrackIDs(albumId, currentPageNo + 1)
        let tracks = await getTrackInfo(trackIds)
        console.log(tracks.map(function ({name, src}) {
            // 移除加qq群文字
            name = name.replace(/（qq.+）/, '')
            let ext = path.extname(url.parse(src).pathname)
            let filename = name + ext
            // 输出为 arai2c 输入文件
            // https://aria2.github.io/manual/en/html/aria2c.html#input-file
            return `${src}\n\tout=${filename}`
        }).join('\n'))
    }
}

async function getTrackIDs(albumId, pageNum) {
    let requestURL = url.format({
        ...url.parse(trackListURL),
        query: {
            albumId,
            pageNum
        }
    })
    let {data: {tracks}} = await fetch(requestURL).then(res => res.json())
    return tracks.map(function ({trackId}) {
        return trackId
    })
}

async function getTrackInfo(trackIds) {
    let requestURL = url.format({
        ...url.parse(tracksURL),
        query: {
            trackIds: trackIds.join(',')
        }
    })
    let {data: {tracksForAudioPlay: tracks}} = await fetch(requestURL).then(res => res.json())
    return tracks.map(function ({trackName, src}) {
        return {
            name: trackName,
            src
        }
    })
}

main()
