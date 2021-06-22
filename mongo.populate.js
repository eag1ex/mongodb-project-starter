/*
    mongo test runs, and DB population
 */

const { MongoDB, DBcontrollers, Bucket, Subtask } = require('./libs')
const { onerror, log, attention } = require('x-utils-es/umd')
const dataInsert = require('./data.inserts')
const CONFIG = require('./config')
const populate = async() => {
    const mongo = new MongoDB(true)
    await mongo.status

    //  const executes.db = {
    //     db:{}
    // }
    const executes = new DBcontrollers()


    // or indirectly this
    // const bucketModel = new Bucket().$
    // const subtaskModel = new Subtask().$

    const exec = async() => {
        let modelDocs // {bucketDoc,subtaskDoc}

        const defaultUser = {
            user: {
                name: CONFIG.defaultUser
            }
        }

        log('[populate][exec]', 'We will {purgeDB()} first, then run {bucketCollectionInsert()}')

        // ------- NOTE remove all data from bucket, including subtasks
        let purged = await executes.db.purgeDB()
        attention('[purged]', purged)
        // return

        // ------- NOTE populate our data with data.inserts.js
        // let populatedBucketList = await executes.db.bucketCollectionInsert(dataInsert, defaultUser)
        // attention('[bucketCollectionInsert]', populatedBucketList)
        // return

        // ------- NOTE remove only subtasks
        // let deleted = await executes.db.removeSubtasks(['604636f6d0454c08fc4151e4'])
        // attention('[subtask][deleted]', deleted)

        // ------- NOTE remove Bucket and any containing subtasks
        // let deleted = await executes.db.removeBucketWithSubtask('6046394a864a27230cb75502')
        // attention('[bucket][deleted]', deleted)
        // return

        // ------- NOTE list all buckets with subtasks
        // const bucketList = await executes.db.listBuckets(1000)
        // attention('[bucketList]', JSON.stringify(bucketList,null,2) )
        // return

        // ------ NOTE uncomment this return, to execute manual inserts, and updates -------------
        return

        let bucket = await executes.db.createBucket({
            ...defaultUser,
            title: 'Trim to Thanland',
            status: 'pending'
        })

        attention('[Bucket]:\n', bucket)

        // NOTE to update bucket
        // bucket = await executes.db.updateBucket(bucket._id, { status: 'completed' })
        // attention('[Bucket][completed]:\n', bucket)

        await executes.db.createSubtask(bucket._id, {
            title: 'Visit Bangkok',
            status: 'pending',
            user: { name: bucket.user.name }
        })

        await executes.db.createSubtask(bucket._id, {
            title: 'Visit Ko Pha-ngan',
            status: 'pending',
            user: { name: bucket.user.name }
        })

        await executes.db.createSubtask(bucket._id, {
            title: 'Visit Chatuchak Park',
            status: 'pending',
            user: { name: bucket.user.name }
        })

        await executes.db.createSubtask(bucket._id, {
            title: 'Visit Chiang Mai',
            status: 'pending',
            user: { name: bucket.user.name }
        })

        modelDocs = await executes.db.createSubtask(bucket._id, {
            title: 'Visit Phuket',
            status: 'pending',
            user: { name: bucket.user.name }
        })

        // NOTE to update subtask
        // bucket = modelDocs.bucketDoc
        // subtask = modelDocs.subtaskDoc
        // subtask = await executes.db.updateSubtask(subtask._id, { status: 'completed' })
        // attention('[subtask][update]:\n', subtask)

        bucket = await executes.db.bucketWithTasks(bucket._id)
        attention('[Bucket][populated]:\n', bucket)
    }

    exec().catch(err => {
        onerror('[exec]', err)
    })
}

populate().catch(err => {
    onerror('[populate]', err)
})
