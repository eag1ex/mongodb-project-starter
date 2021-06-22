
const validate = require('mongoose-validate')
const mongoose = require('mongoose')
const { log } = require('x-utils-es/umd')

/**
 * Bucket class
 * @example new Bucket().model/$
 */
class Bucket {
    constructor() {
        this.model = this.$ = null
        this.make()
    }

    make(name = 'Bucket') {

        const schema = new mongoose.Schema(schemaConstruct(), { timestamps: { createdAt: 'created_at' } })

        schema.post('save', function (doc) {
            log('[bucket][saved]', doc._id)
        })

        schema.post('updateOne', function (doc) {
            log('[bucket][updated]', doc._id)
        })

        schema.post('deleteOne', function (doc) {
            log('[bucket][removed]', doc._id)
        })

        schema.post('remove', function (doc) {
            log('[bucket][removed]', doc._id)
        })

        const Model = mongoose.model(name, schema)
        this.validators(Model, name)
        this.model = this.$ = Model
        return this
    }

    preHooks(schema) {}

    validators(Model, name) {
        Model.schema.path('status').validate(function (value) {
            return ['pending', 'completed'].indexOf(value) !== -1
        }, `Invalid status, refer to ${name} Schema`)

        Model.schema.path('title').validate(function (value) {
            return value.length > 1
        }, `Invalid title, refer to ${name} Schema`)
    }
}


function schemaConstruct() {
    return {
        user: {
            name: { type: String, required: true, validate: [validate.alphanumeric, 'Invalid user/name'] },
            // password:{type:String} // this would be a salt
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

        // NOTE referencing our Subtasks Model
        subtasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subtask',
            },
        ],
    }
}

module.exports = Bucket
