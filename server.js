const mongoose = require('mongoose');
var express = require('express');
var multer = require('multer')
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Latest = require('./models/data');
const Doc = require('./models/document');

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * init app for server with express mongo and simple logging / file upload using multer
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
const API_PORT = 8000;


var app = express();
app.use(cors());
const router = express.Router();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DATABASE SECTION (MongoDB) */
// this is our MongoDb database
const dbRoute = 'mongodb://10.228.19.13:27017/documents'
//'mongodb://docuser:admin@127.0.0.1:27017/documents?ssl=false'
  

//'mongodb://<your-db-username-here>:<your-db-password-here>@ds249583.mlab.com:49583/fullstack_app';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/* LOGGING SECTION (Morgan) */
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FILE STORAGE SECTION (MULTER) */

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dest = 'public/files';//`files/${Date.now()}/`;
        //mkdirp.sync(dest);
        cb(null, dest)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`)
        //cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage }).single('file')

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API ENDPOINT SECTION (EXPRESS) */
/// put for update without incomming https
async function updateLatest(document){

    let exists = await Latest.findOne({"ogName": document.ogName});

    console.log(exists);

    if(exists === null){
        let latest = new Latest();

        latest.ogName = document.ogName;
        latest.latestName = document.name;
        latest.fileBsonId = document._id;
        latest.versions.push(document.name);
        
        latest.revisions = 1;
        latest.save().then(() => {
            console.log(`saved to latest (there was no existing file with this name so created new latest entry id: ${latest._id}`);
        }).catch(error => {
            console.log("latest not loaded someshit happened");
            console.log(error);
        });
        return;
    } else {
        exists.revisions = exists.revisions + 1;

        exists.latestName = document.name;
        exists.fileBsonId = document._id;
        exists.versions.push(document.name);

        exists.save()
          .then(() => {
            console.log(`saved to latest (existing latest was there so OVERRIDE) id: ${exists._id}`);
          })
         .catch(err => {
          console.log(err);
        });

        // //latest.save();
        return;
    }
}

//app.post('/upload', function (req, res) {
router.post('/upload', function (req, res) {

    var data = new Doc();
    
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("error 500")
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        
        console.log("successful upload");
        console.log(req.file);
        //let exists = Doc.find({"ogName": "sampledoc.txt"}).count() > 0;
        //console.log(exists);

        data.name = req.file.filename;
        data.ogName = req.file.originalname;
        data.required = ['1', '2', '3'];
        data.save()
        .then(() => {
            updateLatest(data);
            return res.status(201).json({
                success: true,
                id: data._id,
                message: 'Document uploaded!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'document not uploaded!',
            })
        });
        //     (err) => {
        // if (err) console.log(`db error @@@@ ${err}`);
        // console.log('successfully added to db')
        // });

        //return res.status(200).send(req.file)

    })

});


// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
    const { id } = req.body;
    Doc.findOneAndDelete(id, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
  });

  router.delete('/deleteLatest', (req, res) => {
    const { id } = req.body;
    Latest.findOneAndDelete(id, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
  });

/*  sample apis

// this method fetches all available data in our database
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our create method
// this method adds new data in our database
router.post('/putData', (req, res) => {
  let data = new Data();

  const { id, message } = req.body;

  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

*/

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ App Start */

// append /api for our http requests
app.use('/api', router);

app.listen(API_PORT, function () {

    console.log(`App running on port ${API_PORT}`);

});

