// example from: https://ckhconsulting.com/parsing-large-json-with-nodejs/
/**
 * This file is used to load large json array file as stream,
 * - each array item is written to own file, use> readFile method to read them
 */

throw `before using this script, you need to provide {yourSourceDataPath}`

const { dataDump } = require('../../config')

// NOTE  dataDump is the root directory, in which `/files/file-{key}` will be created
const { writeFile, readFile } = require('x-fs')({ dir: dataDump, path: './files', ext: '.json' })



const StreamArray = require('stream-json/streamers/StreamArray')
const fs = require('fs')
const { Writable } = require('stream')
const path = require('path')
const { onerror } = require('x-utils-es/umd')

const dataPath = path.join(__dirname, '../../assets/{yourSourceDataPath}')
const jsonStream = StreamArray.withParser()
//internal Node readable stream option, pipe to stream-json to convert it for us
const fileStream = fs.createReadStream(dataPath)

const processingStream = new Writable({
    write({ key, value }, encoding, callback) {
        //some async operations can be provided here
        //setTimeout(() => {
        // write each json file line to  file with key sufix
        if (value) writeFile(`file-${key}`, value)
        else onerror(`no data at index ${key}`)
        //Runs one at a time, need to use a callback for that part to work
        callback()
        //}, 1000);
    },
    //Don't skip this, as we need to operate with objects, not buffers
    objectMode: true,
})

// @ts-ignore
fileStream.pipe(jsonStream.input)
jsonStream.pipe(processingStream)

//So we're waiting for the 'finish' event when everything is done.
processingStream.on('finish', () => console.log('All done'))
