declare namespace common {

    type TENV = 'development' | 'production'
    declare interface IMongoConfig {
        remote?: boolean;
        database?: string;
        defaultUser?: string;
    }

}

declare namespace model {

    declare interface IBucket {
        _id?: string;
        user: { name: string };
        title: string;
        status: 'pending' | 'completed';
        subtasks?: Array<string>
    }

    /**
     * Belongs to IBucket
     */
    declare interface ISubtask{
        _id?: string;
        user: { name: string };
        title: string;
        status: 'pending' | 'completed';
    }

    declare interface IBucketComb{
        _id?: string;
        user: { name: string };
        title: string;
        status: 'pending' | 'completed';
        subtasks?:Array<ISubtask>
    }



    // NOTE GeoPolygons wrapper
    // declare interface ActModel {
    //     type: string;
    //     features: Array<CountryoPolygonModel>
    // }

}

/*
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
* */

//export as namespace types
export { model }
export { common }


