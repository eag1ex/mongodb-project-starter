declare namespace common {
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

}


//export as namespace types
export { model }
export { common }


