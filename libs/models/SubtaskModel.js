
const validate = require('mongoose-validate')
const mongoose = require('mongoose')
const { log } = require('x-utils-es/umd')


/**
 * Bucket class
 * @example new Bucket().model/$
 */
class Subtask {

    constructor() {
        this.model = this.$ = null
        this.make()
    }

    make(name = 'Subtask') {

        const schema = new mongoose.Schema(
            schemaConstruct(),
            { timestamps: { createdAt: 'created_at' } }
        )

        schema.post('deleteOne', function(doc) {
            log('[subtask][deleted]', doc._id)
        })

        schema.post('save', function(doc) {
            log('[subtask][saved]', doc._id)
        })

        schema.post('updateOne', function(doc) {
            log('[subtask][updated]', doc._id)
        })

        schema.post('remove', function(doc) {
            log('[subtask][removed]', doc._id)
        })

        const Model = mongoose.model(name, schema)
        this.validators(Model, name)
        this.model = this.$ = Model

        return this
    }

    validators(Model, name) {
        Model.schema.path('status').validate(function(value) {
            return ['pending', 'completed'].indexOf(value) !== -1
        }, `Invalid status, refer to ${name} Schema`)

        Model.schema.path('title').validate(function(value) {
            return value.length > 1
        }, `Invalid title, refer to ${name} Schema`)
        return this
    }
}


/**
 * @returns {{}}
 */
function schemaConstruct() {
    return {
        user: {
            name: { type: String, required: true },
        },

        title: {
            type: String,
            required: true,
        },

        // [pending,completed]
        status: {
            type: String,
            required: true,
            validate: [validate.alpha, 'Invalid status'],
        },
    }
}

module.exports = Subtask
