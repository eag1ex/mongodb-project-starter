


/**
 *  @typedef {import("../types").model.IBucket} IBucket
 *  @typedef {import("../types").model.ISubtask} ISubtask
 *  @typedef {import("../types").model.IBucketComb} IBucketComb
 */

const { onerror, log, copy, warn } = require('x-utils-es/umd')


/**
 * @DBControllers class
 * our mongo executes live here
 */
// @ts-ignore
function DBControllers(mongo, debug = false) {

    const { Bucket, Subtask } = require('./models')

    const o = {}

    // our db models
    const db = {
        Bucket: new Bucket().$,
        Subtask: new Subtask().$
    }

    /**
     * @memberof Bucket
     * Create new initial Bucket
     * @param {IBucket} bucketData data object {title,status}
     * @returns {Promise<Bucket & IBucket>}
     */
    const createBucket = function(bucketData) {
        return db.Bucket.create(bucketData)
    }

    /**
     * @memberof Subtask/Bucket
     * Create new initial Subtask belonging to Bucket
     * @param {string} bucketID _id
     * @param {ISubtask} subtaskData data object {title,status}
     * @returns {Promise<{bucketDoc:Bucket & IBucket, subtaskDoc:Subtask & ISubtask}>} 
     */
    const createSubtask = (bucketID, subtaskData) => {
        return db.Subtask.create(subtaskData).then(async(_doc) => {

            /**
             * @type {Subtask & ISubtask}
             */
            const doc = _doc
            
            const bucketDoc = db.Bucket.findByIdAndUpdate(
                bucketID,
                {
                    $push: {
                        subtasks: {
                            _id: doc._id,
                            title: doc.title,
                            status: doc.status,
                            // REVIEW this method maybe not ideal, we should use db.Bucket.findById> update
                            // to get the user from bucket instead, for now will do
                            user: { name: doc.user.name }
                        }
                    }
                },
                { new: true, useFindAndModify: false }
            ).then(doc => {
                // make sure every time we add new subtask the bucket become pending
                if (doc.status !== 'pending') {
                    log('updating Bucket to status:pending')
                }

                return doc.update({ status: 'pending' })
            })
            return Promise.all([bucketDoc, Promise.resolve(doc)])
        }).then(docs => {
            
            // @ts-ignore
            let [bucketDoc, subtaskDoc] = Array.from(docs).values()
            return { bucketDoc, subtaskDoc }
        })
    }

    /**
     * @memberof Subtask
     * Updates existing Subtask
     * @param {string} subtaskID
     * @param {ISubtask} subtaskData
     * @returns {Promise<Subtask & ISubtask>}
     */
    const updateSubtask = (subtaskID, subtaskData) => {
        return db.Subtask.findByIdAndUpdate(subtaskID, {
            status: subtaskData.status
        }, { new: true, useFindAndModify: false })
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for subtaskID:${subtaskID}`)
                }
                return doc
            })
    }

    o.createBucket = createBucket
    o.updateSubtask = updateSubtask

    /**
     * @memberof Bucket
     * - group list of available buckets with subtasks
     * - exclude props: {__v,updatedAt} 
     * @param {number} limit
     * @returns {Promise<Bucket & IBucketComb[]>}
     */
    o.listBuckets = function(limit = 1) {
        // @ts-ignore
        return db.Bucket.find({})
            .populate({ path: 'subtasks', select: '-__v -updatedAt' })
            .select('-__v -updatedAt')
            .limit(limit).sort('created_at')
    }

    /**
     * @memberof Bucket
     * Find and return Bucket with subtasks
     * @param {string} bucketID
     * @returns {Promise<Bucket & IBucketComb>}
     */
    o.getBucket = (bucketID) => {
        return db.Bucket.findById(bucketID)
            .populate({ path: 'subtasks', select: '-__v -updatedAt' })
            .select('-__v -updatedAt')
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for bucketID:${bucketID}`)
                }
                return doc
            })
    }

    /**
     * @memberof Bucket
     * Updates existing Bucket
     * @param {string} bucketID _id
     * @param {IBucket} bucketData data object, `{title,status}`
     * @returns {Promise<Bucket & IBucketComb>}
     */
    o.updateBucket = function(bucketID, bucketData) {
        return db.Bucket.findByIdAndUpdate(bucketID, {
            ...(bucketData.status ? { status: bucketData.status } : {}),
            ...(bucketData.title ? { title: bucketData.title } : {})
        }, { new: true, useFindAndModify: false })
            .populate({ path: 'subtasks', select: '-__v -updatedAt' })
            .select('-__v -updatedAt')
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for bucketID:${bucketID}`)
                }
                log('Bucket updated', doc._id)
                let subsDefer = copy(doc.subtasks).map(n => {
                    // @ts-ignore
                    return updateSubtask(n._id, { status: doc.status })
                })

                return Promise.all([Promise.resolve(doc), ...subsDefer])
            }).then(d => {
                log('Subtasks updated', `count ${d.length - 1}`)
                return d[0] // only return our doc
            })
    }

    /**
     * Update bucket only without subtasks
     * @param {string} bucketID
     * @param {IBucket} bucketData
     * @returns {Promise<Bucket & IBucket>}
     */
    o.updateBucketOnly = function(bucketID, bucketData) {
        return db.Bucket.findByIdAndUpdate(bucketID, {
            ...(bucketData.status ? { status: bucketData.status } : {}),
            ...(bucketData.title ? { title: bucketData.title } : {})
        }, { new: true, useFindAndModify: false })
            .select('-__v -updatedAt -subtasks')
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for bucketID:${bucketID}`)
                } else return doc
            })
    }

    /**
     * @memberof Bucket
     * selects subtasks for this bucket in the output
     * @param {string} bucketID _id
     * @returns {Promise<Bucket & IBucketComb>}
     */
    o.bucketWithTasks = (bucketID) => {
        return db.Bucket.findById(bucketID)
            .populate('subtasks', '-_id -__v -updatedAt') // adds subtasks from by ref, excluding _id,__v
            .select('-__v -updatedAt') // exclude from Bucket in the results
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for bucketID:${bucketID}`)
                }
                return doc
            })
    }

    o.createSubtask = createSubtask

    /**
     * @memberof Subtask
     * Find and return subtask
     * @param {string} subtaskID
     * @returns {Promise<Subtask & ISubtask >}
     */
    o.getSubtask = (subtaskID) => {
        return db.Subtask.findById(subtaskID)
            .select('-__v -updatedAt')
            .then(doc => {
                if (!doc) {
                    return Promise.reject(`nothing updated for subtaskID:${subtaskID}`)
                }
                return doc
            })
    }

    /**
     * 
     * @param {string} bucketID 
     * @returns {Promise<{deleted:any} |{}>}
     */
    o.removeBucketWithSubtask = async(bucketID) => {
        try {
            const doc = await db.Bucket.findById(bucketID)
            if (!doc) return {}

            const ids = doc.subtasks || []
            if (ids.length) await db.Subtask.deleteMany({ _id: { $in: ids } })
            return await { deleted: doc.delete() }
        } catch (err) {
            return Promise.reject(err)
        }
    }

    o.removeSubtasks = (ids = []) => {
        return db.Subtask.deleteMany({ _id: { $in: ids } })
    }

    o.removeBuckets = (ids = []) => {
        return db.Bucket.deleteMany({ _id: { $in: ids } })
    }

    /**
     * @memberof Bucket/Subtask
     * remove all data from Bucket and Subtask models
     * @returns {Promise<{buckets:{n: number, ok: number, deletedCount: number}, subtasks:{n: number, ok: number, deletedCount: number}}>}
     */
    o.purgeDB = async() => {
        try {
            const subtasks = await db.Subtask.deleteMany({})
            const buckets = await db.Bucket.deleteMany({})
            // @ts-ignore
            return { buckets, subtasks }
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**
     * Our custom collection insert of buckets with subtasks using bucketList[] data
     * @param {Array<IBucketComb>} bucketList  array of buckets with subtasks, `[{title,status,subtasks[]},...]`
     * @returns {Promise<{ created: boolean, index: number}>}
     */
    o.bucketCollectionInsert = async(bucketList, defaultUser = {}) => {
        if (!bucketList || [].length) {
            return Promise.reject('bucketList is empty check your ./data.inserts.js')
        }

        if (!defaultUser) {
            return Promise.reject('defaultUser not set!')
        }

        // REVIEW db.Bucket.collection.insertMany(bucketList) // WILL look into it
        let bucIndex = 0
        for (let bucketItem of bucketList) {
            try {
                if (!bucketItem.title || !bucketItem.status) {
                    warn('[bucket]', `missing title/status at bucIndex: ${bucIndex}`)
                    continue
                }

                let subtasks = copy(bucketItem.subtasks) || []
                delete bucketItem.subtasks
                // just in case
                // @ts-ignore
                delete bucketItem.created_at
                // @ts-ignore
                delete bucketItem.id
                // log('add ?',{...bucketItem,...defaultUser})

                // @ts-ignore
                let bucDoc = await createBucket({ ...bucketItem, ...defaultUser })
                log('[bucket][created]', bucDoc._id)
                log(`[subtasks][size]`, subtasks.length)
                for (let sub of subtasks) {
                    let user = { user: { name: bucDoc.user.name } }

                    if (!sub.title || !sub.status) {
                        warn('[bucket][subtask]', `missing title/status at bucIndex: ${bucIndex}`)
                        break
                    }
                    // just in case
                    delete sub.created_at
                    delete sub.todo_id // _id is is generated by mongo
                    const { subtaskDoc } = await createSubtask(bucDoc._id, { ...sub, ...user })
                    log('[bucket][subtask][created]', subtaskDoc._id)
                }
                bucIndex++
            } catch (err) {
                onerror('[bucketCollectionInsert]', err)
                continue
            }
        }

        if (!bucIndex) {
            return Promise.reject('no buckets created')
        }
        return { created: true, index: bucIndex }
    }
    this.db = o
}

module.exports = DBControllers



