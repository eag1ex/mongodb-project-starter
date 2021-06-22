
/**
 * @Mongo
 * Mongoose connection
 * @example new MongoDB().status.then
 **/

const CONFIG = require('../config')
const { onerror, sq, attention } = require('x-utils-es/umd')
const mongoose = require('mongoose')
const { Subject } = require('rx')

class MongoDB {
    
    /** Returns a promise on database connection, or rejection */
    status = sq()
    $subStatus = new Subject()  

    constructor(debug = false) {
        this.debug = debug

        this.$subStatus.subscribe(n=>{
            attention(n)
            this.status.resolve(n)
        },err=>{
            this.status.reject(err)
        })
      
        this.presets() // 
        this.init()
    }

    /**
     * mongoose presets
     */
    presets() {
        
        mongoose.Promise = Promise
        this.mongoose = mongoose
        this.DATABASE = CONFIG.database
    }

    get options() {
        return {
            // "loggerLevel": "info",
            // ssl: CONFIG.remote ? true:false,
            sslValidate: !!CONFIG.remote,
            poolSize: 30,
            mongos: true,
            // useMongoClient: true,
            keepAlive: 300000,
            // autoReconnect: true,
            connectTimeoutMS: 30000,
            // bufferMaxEntries :10,
            // bufferCommands :true,
            useUnifiedTopology: true,
            useNewUrlParser: true,
            promiseLibrary: this.mongoose.Promise,
        }
    }

    async init() {
        try {
            this.connect()
            return true
        } catch (err) {
            onerror('[init]', err)
        }
        return Promise.reject()
    }


    /**
     * Connect to database
     */
    connect() {
        // @ts-ignore
        this.mongoose.connect(this.DATABASE, this.options)
        const db = this.mongoose.connection
        db.on('error', (err) => {
            onerror(err)
            this.$subStatus.onError('[mongoose] connection error')
        }).once('open', () => {

            if (CONFIG.remote) this.$subStatus.onNext('[mongoose][remote] connected')
            else this.$subStatus.onNext('[mongoose] connected')
            
        })

        return this
    }
}
module.exports = MongoDB
