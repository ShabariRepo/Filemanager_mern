const mongoose = require('mongoose');
var express = require('express');
var multer = require('multer')
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Latest = require('./models/data');
const Doc = require('./models/document');
const fs = require('fs');

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * init app for server with express mongo and simple logging / file upload using multer
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
const API_PORT = 8000;

var app = express();
app.use(cors());
// make the folder static & momunt
app.use(express.static('./public')) 
const router = express.Router();

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DATABASE SECTION (MongoDB) */
// this is our MongoDb database
const dbRoute = 'mongodb://10.228.19.13:27017/documents'
//'mongodb://docuser:admin@127.0.0.1:27017/documents?ssl=false'
  

//'mongodb://<your-db-username-here>:<your-db-password-here>@ds249583.mlab.com:49583/fullstack_app';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true, useFindAndModify: false });

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
// delete the file from the file system
const deleteFile = (file) => {
  console.log(`inside delete file to unlink:  ${file}`);
  fs.unlink("public/files/"+file, (err) => {
    if (err) console.log(err);
  })
}

/// put for update without incomming https
async function updateLatest(document, remove, distinct){

    let exists = await Latest.findOne({"ogName": document.ogName});

    console.log(exists);

    if(exists === null){
        let latest = new Latest();

        latest.ogName = document.ogName;
        latest.latestName = document.name;
        latest.fileBsonId = document._id;
        latest.distinction = distinct;
        latest.versions.push(document.name);
        
        latest.revisions = 1;
        latest.save().then(() => {
            console.log(`saved to latest (there was no existing file with this name so created new latest entry id: ${latest._id}`);
            // return latest;
        }).catch(error => {
            console.log("latest not loaded someshit happened");
            console.log(error);
            // return error;
        });
    } else {
        if (remove) {
          console.log('inside removing the file');
          var latestFlag = false;
          // shouldn't be able to delete latest
          if(exists.latestName === document.name){
            console.log(`Cannot Delete latest version please override if you want to delete latest`);
            latestFlag = true;
          }

          exists.revisions = (exists.revisions > 0) ? exists.revisions - 1 : exists.revisions;

          
          // if the last one is removed then remove the latest document
          if(exists.revisions < 1){
            exists.remove().then(() => {
              console.log(`removed file from latest cuz it was the only one and was deleted ${exists._id}`)
            });
            deleteFile(document.name);
            return;
          }
          
          // if array contains the given name then remove it at the index
          if(exists.versions.includes(document.name)){
            var idx = exists.versions.lastIndexOf(document.name);
            console.log(idx);
            
            exists.versions.splice(idx, 1);
            if(latestFlag){
              let prior = idx - 1;
              exists.latestName = exists.versions[prior];
              console.log(`Deleting latest version ${document.name} and moving previous up ${exists.versions[prior]}`);
            }
          } else{
            console.log(`this file did not exist in the versions array ${document.name}`);
            return;
          }

          // else save the document with 1 version less and check if the latest was removed
          deleteFile(document.name);
          exists
            .save()
            .then(() => {
              console.log(
                `saved to latest (existing latest was there so OVERRIDE) id: ${exists._id}`
              );
            })
            .catch(err => {
              console.log(err);
            });

          // //latest.save();
          return;
        } else {
          exists.revisions = exists.revisions + 1;

          exists.latestName = document.name;
          exists.fileBsonId = document._id;
          exists.versions.push(document.name);

          exists
            .save()
            .then(() => {
              console.log(
                `saved to latest (existing latest was there so OVERRIDE) id: ${exists._id}`
              );
              // return exists;
            })
            .catch(err => {
              console.log(err);
              // return err;
            });
        }
    }
}

//app.post('/upload', function (req, res) {
router.post('/upload', (req, res) => {

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
            updateLatest(data, false);
            return res.status(201).json({
              success: true,
              id: data._id,
              data: data,
              url: `http://10.228.19.13:3000/files/${data.name}`,
              message: "Document uploaded!"
            });
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

router.delete('/deleteDoc', function(req, res){
  console.log(req.body)
  const { source } = req.body;
  Doc.findOneAndRemove({ "name": source }, (err, doc, result) => {
    if(err) return res.send(err);

    console.log(doc);
    updateLatest(doc, true, "");
    return res.json({ 
      success: true,
      data: doc,
      message: "document deleted!"
    });
  })
});

// this is our delete method
// this method removes existing data in our database
router.delete('/deleteData', (req, res) => {
    const { id } = req.body;
    Doc.findOneAndDelete({ "_id": id }, (err) => {
      if (err) return res.send(err);
      return res.json({ success: true });
    });
  });

router.delete('/deleteLatest', (req, res) => {
  const { id } = req.body;
  Latest.findOneAndDelete({ "_id": id }, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// get all the latest docs
router.get('/getLatest', (req, res) => {
  Latest.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// get all individual docs
router.get('/getAllDocs', (req, res) => {
  Doc.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// get all files named that original name
getDocsByOg = async (req, res) => {
  //let exists = await Latest.findOne({"ogName": document.ogName});
  const { ogName } = req.body;
  // console.log(req);
  await Doc.find( {"ogName": ogName}, (err, data) => {
    if(err) return res.json({ success: false, error: err});
    return res.status(200).json({
      success: true,
      data: data
    });
  });
}

getLatestByOg = async (req, res) => {
  const { ogName } = req.body;

  await Latest.findOne({"ogName": ogName}, (err, data) => {
    if(err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
}

// get all documents that have a specific "ogName"
router.post('/getDoc', getDocsByOg);

// get latest document that has a specific "ogName"
router.post('/getLatest', getLatestByOg);

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

