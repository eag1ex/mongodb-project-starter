
// NOTE you can host mongoDB on local environment also, just need to set it up
let dbRemote = false
const path = require('path')

module.exports = {
    // optional root full path to data dump for export
    dataDump: path.join(__dirname, './dataDump'),
    remote: dbRemote,
    // negotiate database path
    database: dbRemote ? '' : `mongodb://localhost/exampleDB`,
    defaultUser: 'johndoe', // our database default user
}
