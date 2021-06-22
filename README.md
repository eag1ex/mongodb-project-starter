## Mongo DB project starter
#### - [ Developed by Eaglex ](http://eaglex.net)
This is a get working project starter, everything needed from connecting to database, mongoose schemas, and controller methods.  **One to Many** ideology.

### Config.js
Refer to config file, where you can set your database preferences


### Model/Example
Current setup is based on Bucket/Subtask models

### Start
1. If you dont already have MongoDB installed refer to: `https://docs.mongodb.com/manual/administration/install-community/` 
2. execute the file `./mongoDB.bat` or run `/$ mongod --dbpath {pathToMongoData}` ()
3. run script `/$ node mongo.populate.js`


### Loading large 
To load large json array file in sequence to database, refer to starter example in : `./libs/stream`

### Notes
Not all files maybe required so remove what not needed.
