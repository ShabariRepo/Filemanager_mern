const mongoose = require("mongoose");
var express = require("express");

var multer = require("multer");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");

const Latest = require("./models/data");
const Doc = require("./models/document");
const fs = require("fs");

const path = require("path");
const sql = require("./mysqldb");
const axios = require("axios");
const qs = require("qs");


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
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
 
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));
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

/// FUNCTIONS TO BE USED BY APIs
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

// delete all files in the file system here
const deleteAllFiles = (directory) => {
  fs.readdir("public/files/", (err, files) => {
    if (err) throw err;
  
    for (const file of files) {
      // fs.unlink(path.join(directory, file), err => {
      fs.unlink("public/files/"+file, err => {
        if (err) console.log(err);
      });
    }
  });
}


/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * helper helper helper helper helper
 * ~~~~~~~~~ CMS CRUD TASKS ~~~~~~~~~~~
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// update documents sql for CMS
addToCms = async (doc) => {
  console.log('CREATE in CMS DB');
  var dt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  var cmsdoc = {
    title: doc.ogName,
    file: `http://10.228.19.13:3000/files/${doc.latestName}`,
    collection_id: 1,
    file_hash: 'ccbd55c2102e4a3d10919ee387b7cef823459e01',
    created_at: dt
  }

  sql.query("INSERT INTO wagtail.wagtaildocs_document SET ?", cmsdoc, function(err, res){
    if(err){
      console.log("mysql error: ", err);
    } else {
      console.log(res)
    }
  })
}

// update the document in cms db
UpdateCms = async (doc, prev) => {
  console.log('UPDATE in CMS DB');
  var cmsdoc = {
    title: doc.ogName,
    file: `http://10.228.19.13:3000/files/${doc.latestName}`,
    collection_id: 1,
    file_hash: 'ccbd55c2102e4a3d10919ee387b7cef823459e01'
  }
  
  sql.query("UPDATE wagtail.wagtaildocs_document SET document = ? WHERE file = ?", [cmsdoc, prev], function(err, res){
    if(err){
      console.log("mysql error: ", err);
    } else {
      console.log(res)
    }
  })
}

/// put for update without incomming https
async function updateLatest(document, remove, distinct, opid, quoteid){

    // var distinct = body.dkey;
    // var cms = body.cms;
    let exists = await Latest.findOne({"ogName": document.ogName, "dkey": distinct, "opid": opid, "quoteid": quoteid});

    console.log(exists);

    // create new
    if(exists === null){
        let latest = new Latest();

        latest.ogName = document.ogName;
        latest.latestName = document.name;
        latest.fileBsonId = document._id;
        latest.dkey = distinct;
        latest.opid = opid;
        latest.quoteid = quoteid;
        latest.versions.push(document.name);
        
        latest.revisions = 1;
        latest.save().then(() => {
            console.log(`saved to latest (there was no existing file with this name so created new latest entry id: ${latest._id}`);
            addToCms(latest);
            // return latest;
        }).catch(error => {
            console.log("latest not loaded someshit happened");
            console.log(error);
            // return error;
        });
    } else {
      // removing document record
        if (remove) {
          console.log('inside removing the file');
          var latestFlag = false;
          var oldExists = {};
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
            // delete from CMS
            return;
          }
          
          // if array contains the given name then remove it at the index
          if(exists.versions.includes(document.name)){
            var idx = exists.versions.lastIndexOf(document.name);
            console.log(idx);
            // create copy of var
            oldExists = Object.assign({}, exists);

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
              UpdateCms(exists, `http://10.228.19.13:3000/files/${oldExists.latsetName}`);
            })
            .catch(err => {
              console.log(err);
            });

          // //latest.save();
          return;
        } else {
          // update sql for cms so make copy of exists
          var oldExists = Object.assign({}, exists);
          
          // increment and add to array
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
              UpdateCms(exists, `http://10.228.19.13:3000/files/${oldExists.latsetName}`);
            })
            .catch(err => {
              console.log(err);
              // return err;
            });
        }
    }
}

/// get individual from latest and files collections

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

  await Latest.find({"ogName": ogName}, (err, data) => {
    if(err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
}


getLatestByDkey = async (req, res) => {
  const { dkey } = req.body;

  await Latest.find({"dkey": dkey}, (err, data) => {
    if(err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
}

getDistinctFromLatest = async (req, res) => {
  Latest.find().distinct('dkey', function(err, data) {
    data.sort();
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
}

getDistinctHashMap = async (req, res) => {
  Latest.find((err, data) => {
    dkeys = [];
    latest = {};

    if (err) return res.json({ success: false, error: err });

    // let prevDist = "";
    data.forEach(element => {
      // prevDist = element.dkey;
      if(!dkeys.includes(element.dkey)){
        let objarr = [];
        dkeys.push(element.dkey);
        objarr.push(element);
        latest[element.dkey] = objarr;
      } else{
        latest[element.dkey].push(element);
      }
    });
    dhash = {
      dkeys: dkeys,
      fhash: latest
    };

    return res.json({ success: true, data: dhash });
  }).sort({ dkey: 1 }).th;
}

// get by opportunity id
getOpIdHashMap = async (req, res) => {
  Latest.find((err, data) => {
    okeys = [];
    latest = {};

    if (err) return res.json({ success: false, error: err });

    // let prevDist = "";
    data.forEach(element => {
      // prevDist = element.opid;
      if(!okeys.includes(element.opid)){
        let objarr = [];
        okeys.push(element.opid);
        objarr.push(element);
        latest[element.opid] = objarr;
      } else{
        latest[element.opid].push(element);
      }
    });
    dhash = {
      okeys: okeys,
      fhash: latest
    };

    return res.json({ success: true, data: dhash });
  }).sort({ opid: 1 }).th;
}

// get by quote id
getQuoteIdHashMap = async (req, res) => {
  Latest.find((err, data) => {
    qkeys = [];
    latest = {};

    if (err) return res.json({ success: false, error: err });

    // let prevDist = "";
    data.forEach(element => {
      // prevDist = element.quoteid;
      if(!qkeys.includes(element.quoteid)){
        let objarr = [];
        qkeys.push(element.quoteid);
        objarr.push(element);
        latest[element.quoteid] = objarr;
      } else{
        latest[element.quoteid].push(element);
      }
    });
    dhash = {
      qkeys: qkeys,
      fhash: latest
    };

    return res.json({ success: true, data: dhash });
  }).sort({ quoteid: 1 }).th;
}

// Cherwell token & integration section
const cTokenUrl = "https://cherwell-uat.centrilogic.com/cherwellapi/token";
const cPushUrl =
  "https://cherwell-uat.centrilogic.com/CherwellAPI/api/V1/savebusinessobjectattachmenturl";
var cherwellToken = "";
var cherwellRefToken = "";
var tokenDateTime = "";

// post new url to CHERWELL with bearer token
postToCherwell = async (ogName, link, busObId, busObPubicId) => {
  // need to get token first
  // check if time has elapsed
  let now = new Date();
  var exp = Math.floor(((now - tokenDateTime)/1000)/60);
  // if (cherwellToken === "") {
  if(exp > 10){
    // getCherwellToken();
    // console.log("await token needed if displayed before request comes back");
    const requestBody = {
      client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
      grant_type: "password",
      username: "Cherwell\\esbtester",
      password: "Testtest1"
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    axios
      .post(cTokenUrl, qs.stringify(requestBody), config)
      .then(result => {
        // save token in var
        console.log(
          `success requesting token from cherwell: ${result.data.access_token}`
        );
        cherwellToken = result.data.access_token;
        cherwellRefToken = result.data.refresh_token;
        tokenDateTime = new Date();
	console.log(result.data);
        pushToDestC(ogName, link, busObId, busObPubicId);
      })
      .catch(err => {
        // Do somthing
        console.log("There was an issue with getting cherwell token");
        console.log(err);
      });
  } else {
    // then post to cherwell with new json
    pushToDestC(ogName, link, busObId, busObPubicId);
  }
};

// push to cherwel
pushToDestC = (ogName, link, busObId, busObPubicId) => {

  var config = {
    headers: { Authorization: "bearer " + cherwellToken }
  };

  var bodyParameters = {
    busObId: busObId,
    busObPublicId: busObPubicId,
    comment: "Successfully uploaded file! Sending download url of file from file manager",
    displayText: ogName,
    includeLinks: true,
    url: link
  };

  axios.put(cPushUrl, bodyParameters, config)
    .then(response => {
      console.log("successfully pushed to cherwell");
      console.log(response);
    })
    .catch(error => {
      console.log("some shit happened while posting to cherwell :| ");
      console.log(error);
    });
}

// axios x-www-form-urlencoded post request
getCherwellToken = () => {
  const requestBody = {
    client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
    grant_type: "password",
    username: "Cherwell\\esbtester",
    password: "Testtest1"
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  axios
    .post(cTokenUrl, qs.stringify(requestBody), config)
    .then(result => {
      // save token in var
      console.log(
        `success requesting token from cherwell: ${result.access_token}`
      );
      cherwellToken = result.access_token;
    })
    .catch(err => {
      // Do somthing
      console.log("There was an issue with getting cherwell token");
      console.log(err);
    });
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * API API API API API API API API API
 * ~~~~~~~~~ ENDPOINTS ~~~~~~~~~~~
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
//app.post('/upload', function (req, res) {
router.post("/upload", (req, res) => {
  var data = new Doc();
  //console.log(req);
  if (req.body.cherwell) {
    if (
      req.body.dkey === "" ||
      req.body.busObId === "" ||
      req.body.AccountId === "" ||
      req.body.busObPublicId === "" ||
      req.body === undefined
    ) {
      return res.status(400).json({
        error,
        message:
          "document not uploaded! Please provide all of busObId, AccountId and busObPubicId. One or many of these are empty."
      });
    }
  } else {
    if (
      req.body.dkey === "" ||
      req.body.opid === "" ||
      req.body.quoteid === "" ||
      req.body === undefined
    ) {
      return res.status(400).json({
        error,
        message:
          "document not uploaded! Please pass a new distinct folder classificaiton/topic or an existing one"
      });
    }
  }
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.log("error 500");
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    console.log("successful upload");
    console.log(req.file);
    console.log(req.body);
    //let exists = Doc.find({"ogName": "sampledoc.txt"}).count() > 0;
    //console.log(exists);

    data.name = req.file.filename;
    data.ogName = req.file.originalname;
    data.required = ["1", "2", "3"];
    data
      .save()
      .then(() => {
        if (req.body.cherwell) {
          updateLatest(
            data,
            false,
            req.body.dkey,
            req.body.busObId,
            req.body.AccountId
          );
          postToCherwell(
            data.ogName,
            `http://10.228.19.13:3000/files/${data.name}`,
            req.body.busObId,
            req.body.busObPublicId
          );
        } else {
          updateLatest(
            data,
            false,
            req.body.dkey,
            req.body.opid,
            req.body.quoteid
          );
        }
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
          message: "document not uploaded!"
        });
      });
    //     (err) => {
    // if (err) console.log(`db error @@@@ ${err}`);
    // console.log('successfully added to db')
    // });

    //return res.status(200).send(req.file)
  });
});

router.delete("/deleteDoc", function(req, res) {
  console.log(req.body);
  const { source, dkey, opid, quoteid } = req.body;
  Doc.findOneAndRemove({ name: source }, (err, doc, result) => {
    if (err) return res.send(err);

    console.log(doc);
    updateLatest(doc, true, dkey, opid, quoteid);
    return res.json({
      success: true,
      data: doc,
      message: "document deleted!"
    });
  });
});

router.delete('/deleteAllData', (req, res) => {
  Doc.deleteMany({}, err => {
    if (err) return res.send(err);
    deleteAllFiles("public/files/");
    return res.json({ success: true, message: "All files removed from db" });
  })
});

router.delete('/deleteAllLatest', (req, res) => {
  Latest.deleteMany({}, err => {
    if (err) return res.send(err);
    return res.json({ success: true, message: "All files removed from db" });
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

// get all documents that have a specific "ogName"
router.post('/getDoc', getDocsByOg);

// get latest document that has a specific "ogName"
router.post('/getLatestByOg', getLatestByOg);

// get latest document that has a specific "ogName"
router.post('/getLatestByDkey', getLatestByDkey);

// get distinct values from document (distinct folders)
router.get('/getAllDistinct', getDistinctFromLatest);

// get distinct hash values return all sorted into hash
router.get('/getAllDkeyHash', getDistinctHashMap);

// get opid hash values return all sorted into hash
router.get('/getAllByOpHash', getOpIdHashMap);

// get quoteid hash values return all sorted into hash
router.get('/getAllByQuoteHash', getQuoteIdHashMap);

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

