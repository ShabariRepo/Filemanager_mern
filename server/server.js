const mongoose = require("mongoose");
var express = require("express");
// const mongoosastic = require("mongoosastic");

var multer = require("multer");
var cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");

const Latest = require("./models/data");
const Doc = require("./models/document");
const CherwellCustBasic = require("./models/cherwellCust");
const fs = require("fs");

// solr
var SolrNode = require('solr-node');

// Create client
var solrClient = new SolrNode({
  host: '10.228.19.13',//'127.0.0.1',
  port: '8983',
  core: 'kb2',
  protocol: 'http'
});

/* elastic part */
Latest.createMapping(
  {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0,
      analysis: {
        filter: {
          nGram_filter: {
            type: "nGram",
            min_gram: 2,
            max_gram: 20,
            token_chars: ["letter", "digit", "punctuation", "symbol"]
          }
        },
        analyzer: {
          nGram_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding", "nGram_filter"]
          },
          whitespace_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding"]
          }
        }
      }
    },
    mappings: {
      latest: {
        _all: {
          analyzer: "nGram_analyzer",
          search_analyzer: "whitespace_analyzer"
        },
        properties: {
          ogName: {
            type: "text"
          },
          // "movieYear": {
          //     "type": "double"
          // },
          latestName: {
            type: "text"
          },
          fileBsonId: {
            type: "text"
          },
          dkey: {
            type: "text"
          },
          opid: {
            type: "text"
          },
          quoteid: {
            type: "text"
          },
          customer: {
            type: "text"
          }
        }
      }
    }
  },
  (err, mapping) => {
    console.log("mapping created for latest");
    if (err) console.log(err);
  }
);

Doc.createMapping(
  {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0,
      analysis: {
        filter: {
          nGram_filter: {
            type: "nGram",
            min_gram: 2,
            max_gram: 20,
            token_chars: ["letter", "digit", "punctuation", "symbol"]
          }
        },
        analyzer: {
          nGram_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding", "nGram_filter"]
          },
          whitespace_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding"]
          }
        }
      }
    },
    mappings: {
      files: {
        _all: {
          analyzer: "nGram_analyzer",
          search_analyzer: "whitespace_analyzer"
        },
        properties: {
          ogName: {
            type: "text"
          },
          name: {
            type: "text"
          }
        }
      }
    }
  },
  (err, mapping) => {
    console.log("mapping created for document");
    if (err) console.log(err);
  }
);

// create index for nested fields object from cherwell cust mongo doc
CherwellCustBasic.createMapping(
  {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 0,
      analysis: {
        filter: {
          nGram_filter: {
            type: "nGram",
            min_gram: 2,
            max_gram: 20,
            token_chars: ["letter", "digit", "punctuation", "symbol"]
          }
        },
        analyzer: {
          nGram_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding", "nGram_filter"]
          },
          whitespace_analyzer: {
            type: "custom",
            tokenizer: "whitespace",
            filter: ["lowercase", "asciifolding"]
          }
        }
      }
    },
    mappings: {
      cherwellcustbasic: {
        _all: {
          analyzer: "nGram_analyzer",
          search_analyzer: "whitespace_analyzer"
        },
        properties: {
          busObId: {
            type: "text"
          },
          busObPublicId: {
            type: "text"
          },
          busObRecId: {
            type: "text"
          },
          fields: {
            type: "nested",
            properties: {
              dirty: {
                type: "boolean"
              },
              displayName: {
                type: "text"
              },
              fieldId: {
                type: "text"
              },
              html: {
                type: "text"
              },
              name: {
                type: "text"
              },
              value: {
                type: "text"
              }
            }
          }
          // links: {
          //   type: "nested"
          // }
        }
      }
    }
  },
  (err, mapping) => {
    console.log("mapping created for cherwell customer basic info");
    if (err) console.log(err);
  }
);

Latest.synchronize();
Doc.synchronize();
CherwellCustBasic.synchronize();
/* end elastic part */

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
app.use(express.static("./public"));
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DATABASE SECTION (MongoDB) */
// this is our MongoDb database
const dbRoute = "mongodb://10.228.19.14:27018/documents";
//'mongodb://docuser:admin@127.0.0.1:27017/documents?ssl=false'

//'mongodb://<your-db-username-here>:<your-db-password-here>@ds249583.mlab.com:49583/fullstack_app';

// connects our back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true, useFindAndModify: false });

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

/* LOGGING SECTION (Morgan) */
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

/// FUNCTIONS TO BE USED BY APIs
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FILE STORAGE SECTION (MULTER) */
var isEmpty = (obj) => {
  return !obj || Object.keys(obj).length === 0;
}

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var dest = "public/files"; //`files/${Date.now()}/`;
    //mkdirp.sync(dest);
    cb(null, dest);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
    //cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage }).single("file");

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ API ENDPOINT SECTION (EXPRESS) */
// delete the file from the file system
const deleteFile = file => {
  var { name } = file;
  console.log(`inside delete file to unlink:  ${name}`);
  fs.unlink("public/files/" + name, err => {
    if (err) console.log(err);
  });
};

// delete all files in the file system here
const deleteAllFiles = directory => {
  fs.readdir("public/files/", (err, files) => {
    if (err) throw err;

    for (const file of files) {
      // fs.unlink(path.join(directory, file), err => {
      fs.unlink("public/files/" + file, err => {
        if (err) console.log(err);
      });
    }
  });
};

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * helper helper helper helper helper
 * ~~~~~~~~~ CMS CRUD TASKS ~~~~~~~~~~~
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// update documents sql for CMS
addToCms = async doc => {
  console.log("CREATE in CMS DB");
  var dt = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  var cmsdoc = {
    title: doc.ogName,
    file: `http://10.228.19.14:3000/files/${doc.latestName}`,
    collection_id: 1,
    file_hash: "ccbd55c2102e4a3d10919ee387b7cef823459e01",
    created_at: dt
  };

  sql.query("INSERT INTO wagtail.wagtaildocs_document SET ?", cmsdoc, function(
    err,
    res
  ) {
    if (err) {
      console.log("mysql error: ", err);
    } else {
      console.log(res);
    }
  });
};

// update the document in cms db
UpdateCms = async (doc, prev) => {
  console.log("UPDATE in CMS DB");
  // var cmsdoc = {
  //   title: doc.ogName,
  //   file: `http://10.228.19.14:3000/files/${doc.latestName}`,
  //   collection_id: 1,
  //   file_hash: "ccbd55c2102e4a3d10919ee387b7cef823459e01"
  // };

  var docFile = `http://10.228.19.14:3000/files/${doc.latestName}`;
  sql.query(
    "UPDATE wagtail.wagtaildocs_document SET file = ? WHERE file = ?",
    [docFile, prev],
    function(err, res) {
      if (err) {
        console.log("mysql error: ", err);
      } else {
        console.log(res);
      }
    }
  );
};

/// put for update without incomming https
async function updateLatest(
  document,
  remove,
  distinct,
  opid,
  quoteid,
  customer,
  accountId
) {
  // var distinct = body.dkey;
  // var cms = body.cms;
  let exists = await Latest.findOne({
    ogName: document.ogName,
    dkey: distinct,
    opid: opid,
    quoteid: quoteid,
    customer: customer,
    accountId: accountId
  });

  console.log(exists);

  // create new
  if (exists === null) {
    let latest = new Latest();

    latest.ogName = document.ogName;
    latest.latestName = document.name;
    latest.fileBsonId = document._id;
    latest.dkey = distinct;
    latest.opid = opid;
    latest.quoteid = quoteid;
    latest.customer = customer;
    latest.accountId = accountId;
    latest.versions.push(document.name);

    latest.revisions = 1;
    latest
      .save()
      .then(() => {
        console.log(
          `saved to latest (there was no existing file with this name so created new latest entry id: ${latest._id}`
        );
        addToCms(latest);
        // return latest;
      })
      .catch(error => {
        console.log("latest not loaded someshit happened deleting file");
        console.log(error);

        Doc.findOneAndRemove({ name: document.name }, (err, doc, result) => {
          if (err) return res.send(err);
          deleteFile(document.name);
        });
        // return error;
      });
  } else {
    // removing document record
    if (remove) {
      console.log("inside removing the file");
      var latestFlag = false;
      var oldExists = {};
      // shouldn't be able to delete latest
      if (exists.latestName === document.name) {
        console.log(
          `Cannot Delete latest version please override if you want to delete latest`
        );
        latestFlag = true;
      }

      exists.revisions =
        exists.revisions > 0 ? exists.revisions - 1 : exists.revisions;

      // if the last one is removed then remove the latest document
      if (exists.revisions < 1) {
        exists.remove().then(() => {
          console.log(
            `removed file from latest cuz it was the only one and was deleted ${exists._id}`
          );
        });
        deleteFile(document.name);
        // delete from CMS
        return;
      }

      // if array contains the given name then remove it at the index
      if (exists.versions.includes(document.name)) {
        var idx = exists.versions.lastIndexOf(document.name);
        console.log(idx);
        // create copy of var
        oldExists = Object.assign({}, exists);

        exists.versions.splice(idx, 1);
        if (latestFlag) {
          let prior = idx - 1;
          exists.latestName = exists.versions[prior];
          console.log(
            `Deleting latest version ${document.name} and moving previous up ${exists.versions[prior]}`
          );
        }
      } else {
        console.log(
          `this file did not exist in the versions array ${document.name}`
        );
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
          UpdateCms(
            exists,
            `http://10.228.19.14:3000/files/${oldExists.latsetName}`
          );
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
          UpdateCms(
            exists,
            `http://10.228.19.14:3000/files/${oldExists.latsetName}`
          );
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
  await Doc.find({ ogName: ogName }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
};

getLatestByOg = async (req, res) => {
  const { ogName } = req.body;

  await Latest.find({ ogName: ogName }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
};

getLatestByDkey = async (req, res) => {
  const { dkey } = req.body;

  await Latest.find({ dkey: dkey }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.status(200).json({
      success: true,
      data: data
    });
  });
};

getDistinctFromLatest = async (req, res) => {
  Latest.find().distinct("dkey", function(err, data) {
    data.sort();
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
};

getDistinctHashMap = async (req, res) => {
  Latest.find((err, data) => {
    dkeys = [];
    latest = {};

    if (err) return res.json({ success: false, error: err });

    // let prevDist = "";
    data.forEach(element => {
      // prevDist = element.dkey;
      if (!dkeys.includes(element.dkey)) {
        let objarr = [];
        dkeys.push(element.dkey);
        objarr.push(element);
        latest[element.dkey] = objarr;
      } else {
        latest[element.dkey].push(element);
      }
    });
    dhash = {
      dkeys: dkeys,
      fhash: latest
    };

    return res.json({ success: true, data: dhash });
  }).sort({ dkey: 1 }).th;
};

// search solr for KB articles
router.get("/getKbs", (req, res) => {
  const { title } = req.body;
  console.log("this is the title searching for: ", title);
// app.get("/getProduct", function(req, res) {
  var strQuery = solrClient
    .query()
    .q(`nid:*`)
    .fq([
      {
        field: "title",
        value: `*${title}*`
      }
    ]);
  // .facetQuery({
  //   field: "title",
  //   // contains: `${title}`,
  //   query: `*${title}*`
  // });
  
  solrClient.search(strQuery, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Success, found: count = ", result.response.docs.count);
    // console.log("Response:", result.response);
    res.send(result.response);
  });
});

// same as above but post
router.post("/getKbs", (req, res) => {
  const { title } = req.body;
  console.log("this is the title searching for: ", title);
// app.get("/getProduct", function(req, res) {
  var strQuery = solrClient
    .query()
    .q(`nid:*`)
    .fq([
      {
        field: "title",
        value: `*${title}*`
      }
    ]);
  // .facetQuery({
  //   field: "title",
  //   // contains: `${title}`,
  //   query: `*${title}*`
  // });
  
  solrClient.search(strQuery, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("Success, found: count = ", result.response.docs.count);
    // console.log("Response:", result.response);
    res.send(result.response);
  });
});

// search elastic
searchByQuery = async (req, res) => {
  //let exists = await Latest.findOne({"ogName": document.ogName});
  console.log("inside search query");
  const { ogName } = req.body;
  // console.log(req);
  await Latest.search(
    {
      // index: "latests",
      // type: "latest",
      // body: {
      // query: {
      multi_match: {
        query: ogName,
        fields: ["ogName", "dkey", "quoteid", "opid", "latestName"],
        fuzziness: "AUTO"
      }
      // }
      // }
    },
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.status(200).json({
        success: true,
        data: data
      });
    }
  );
};

// search elastic for cherwell customers by customer name
searchByCustName = async (req, res) => {
/*
// havent tried
{"query": {
bool: {
          must: [
            {
              nested: {
                path: "fields",
                query: {
                  bool: {
                    //must: [{ match: { "fields.name": "ID" } }, { match: { "fields.value": custName } }]
                    must: [{ match: { "fields.name": "Name" } }, { match: { "fields.value": custName } }]
                  }
                }
              }
            }
          ]
        }}
}
*/
/*
"nested": {
      "path": "task",
      "query": {
        "match": {
          "name": "alfa33"
        }
      } 
*/
console.log("inside search by customer name (install base) query");
  const { custName } = req.body;
  // console.log(req);
  await CherwellCustBasic.search(
    {
      // nested: {
      //   path: "fields",
      //   query: {
      //     match: {
      //       name: custName
      //     }
      //   }
      // }
      bool: {
        must: [
          {
            nested: {
              path: "fields",
              query: {
                bool: {
                  //must: [{ match: { "fields.name": "ID" } }, { match: { "fields.value": custName } }]
                  must: [{ match: { "fields.name": "Name" } }, { match: { "fields.value": custName } }]
                }
              }
            }
          }
        ]
      }
    },
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.status(200).json({
        success: true,
        data: data
      });
    }
  );
};

// Cherwell token & integration section
const cTokenUrl = "https://cherwell-uat.centrilogic.com/cherwellapi/token";
const cPushUrl =
  "https://cherwell-uat.centrilogic.com/CherwellAPI/api/V1/savebusinessobjectattachmenturl";
const cSrcUrl = "https://cherwell-uat.centrilogic.com/cherwellapi/api/V1/getsearchresults";
var cherwellToken = "";
var tokenDateTime = "";

// post new url to CHERWELL with bearer token
postToCherwell = async (ogName, link, busObId, busObPubicId) => {
  // need to get token first
  // check if time has elapsed
  let now = new Date();
  var exp = Math.floor((now - tokenDateTime) / 1000 / 60);
  // if (cherwellToken === "") {
  if (exp > 10) {
    // getCherwellToken();
    // console.log("await token needed if displayed before request comes back");
    const requestBody = {
      client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
      grant_type: "password",
      username: "Cherwell\\btcms",
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

// pull doc from cherwell
pullDocFromCherwell = async (
  req,
  res,
  attachmentid,
  busobid,
  busobrecid,
  filename
) => {
  // need to get token first
  // check if time has elapsed
  var data = new Doc();
  let now = new Date();
  var exp = Math.floor((now - tokenDateTime) / 1000 / 60);

  // if (cherwellToken === "") {
  if (exp > 10) {
    // getCherwellToken();
    // console.log("await token needed if displayed before request comes back");
    const requestBody = {
      client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
      grant_type: "password",
      username: "Cherwell\\btcms",
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
        // pushToDestC(ogName, link, busObId, busObPubicId);
        axios
          .get(
            `https://cherwell-uat.centrilogic.com/CherwellAPI/api/V1/getbusinessobjectattachment/attachmentid/${attachmentid}/busobid/${busobid}/busobrecid/${busobrecid}`,
            {
              responseType: "stream",
              headers: {
                Authorization: "bearer " + cherwellToken,
                "Content-Type": "application/octet-stream"
              }
            }
          )
          .then(response => {
            console.log("success getting the file");
            // console.log(response);
            // return response.data;
            console.log("inside the token method");
            console.log("inside then pull doc outputting file details now");

            response.data.pipe(
              fs.createWriteStream(`./public/files/${Date.now()}-${filename}`)
            );

            data.name = `${Date.now()}-${filename}`;
            data.ogName = filename;
            data.required = ["1", "2", "3"];
            data
              .save()
              .then(() => {
                //if (req.body.cherwell) {
                updateLatest(
                  data,
                  false,
                  "cherwell",
                  req.body.Type, //req.body.orderId,
                  req.body.ID,
                  req.body.AcctName, //req.body.customer
                  req.body.AcctId
                );
                return res.status(201).json({
                  success: true,
                  // id: data._id,
                  // data: data,
                  url: `http://10.228.19.14:3000/files/${data.name}`,
                  message: "Document found from cherwell"
                });
              })
              .catch(error => {
                // return res.status(400).json({
                //   error,
                //   message: "document not uploaded!"
                // });
                return res.status(400).json({
                  error,
                  message: "document not uploaded!"
                });
              });
          })
          .catch(error => {
            console.log("Issue getting the cherwell document");
            return error;
          });
      })
      .catch(err => {
        // Do somthing
        console.log("There was an issue with getting cherwell token");
        console.log(err);
        return err;
      });
  } else {
    // then post to cherwell with new json
    axios
      .get(
        `https://cherwell-uat.centrilogic.com/CherwellAPI/api/V1/getbusinessobjectattachment/attachmentid/${attachmentid}/busobid/${busobid}/busobrecid/${busobrecid}`,
        {
          responseType: "stream",
          headers: {
            Authorization: "bearer " + cherwellToken,
            "Content-Type": "application/octet-stream"
          }
        }
      )
      .then(response => {
        console.log("success getting the file");
        console.log(response);
        // return response.data;
        console.log("inside then pull doc outputting file details now");

        response.data.pipe(
          fs.createWriteStream(`./public/files/${Date.now()}-${filename}`)
        );

        data.name = `${Date.now()}-${filename}`;
        data.ogName = filename;
        data.required = ["1", "2", "3"];
        data
          .save()
          .then(() => {
            //if (req.body.cherwell) {
            updateLatest(
              data,
              false,
              "cherwell",
              req.body.Type, //req.body.orderId,
              req.body.ID,
              req.body.AcctName, //req.body.customer
              req.body.AcctId
            );
            return res.status(201).json({
              success: true,
              // id: data._id,
              // data: data,
              url: `http://10.228.19.14:3000/files/${data.name}`,
              message: "Document found from cherwell"
            });
          })
          .catch(error => {
            return res.status(400).json({
              error,
              message: "document not uploaded!"
            });
          });
      })
      .catch(error => {
        console.log("Issue getting the cherwell document");
        return error;
      });
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
    comment:
      "Successfully uploaded file! Sending download url of file from file manager",
    displayText: ogName,
    includeLinks: true,
    url: link
  };

  axios
    .put(cPushUrl, bodyParameters, config)
    .then(response => {
      console.log("successfully pushed to cherwell");
      console.log(response);
    })
    .catch(error => {
      console.log("some shit happened while posting to cherwell :| ");
      console.log(error);
    });
};

// axios x-www-form-urlencoded post request
getCherwellToken = () => {
  const requestBody = {
    client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
    grant_type: "password",
    username: "Cherwell\\btcms",
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

// update local token and timer
localCherwellToken = async () => {
  const requestBody = {
    client_id: "c349db90-3ccf-4ec2-b138-360baec64782",
    grant_type: "password",
    username: "Cherwell\\btcms",
    password: "Testtest1"
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  var ret = false;

  await axios
    .post(cTokenUrl, qs.stringify(requestBody), config)
    .then(result => {
      // save token in var
      console.log(
        `success requesting token from cherwell: ${result.data.access_token}`
      );
      cherwellToken = result.data.access_token;
      cherwellRefToken = result.data.refresh_token;
      tokenDateTime = new Date();
      ret = true;
    })
    .catch(err => {
      // Do somthing
      console.log("There was an issue with getting cherwell token");
      console.log(err);
    });
  return ret;
};

// fetch cust info from cherwell single function
getBasicCustInfo = async () => {
  var config = {
    headers: { Authorization: "bearer " + cherwellToken }
  };

  /*
  "busObId": "94530cad6a08f5e1badb824e75a5fd0053585106b0",
  "pageSize": 5000,
  //"fields": [
	//"94530cad6ab096de45e94a4093af484382d4d42135",
    //"94530cad6a3a6ff1cf9b8f485f87a2353e44c5126c",
	//"94530cad6ab586b9e6c5a04ce681d331b73d80da29"
  //],
  "includeAllFields": true,
  "includeSchema": false,
  */

  var bodyParameters = {
    busObId: "94530cad6a08f5e1badb824e75a5fd0053585106b0",
    pageSize: 5000,
    includeAllFields: true,
    includeSchema: false
  };

  custData = {};
  await axios
    .post(cSrcUrl, bodyParameters, config)
    .then(response => {
      console.log("successfully got basic customer info from cherwell");
      // console.log(response);
      custData = response.data.businessObjects;
    })
    .catch(error => {
      console.log("some shit happened while getting basic customer info from cherwell :| ");
      console.log(error);
      // custData = error
    });
  
  return custData;
};

deleteChCustBasic = async () => {
  var ret = {};
  ret = await CherwellCustBasic.deleteMany({}, err => {
    var rr = {};
    if (err) rr = {success: false, message: err};
    rr = { success: true, message: "all basic customer data from cherwell deleted" };

    console.log("deleting cherwell cust basic status", rr);
    // return rr;
  });
  
  console.log("return value", ret);
  return ret;
}

// update cherwell cust basic info and send back hash
getCherwellCustInfoBasic = async (req, res) => {
  let now = new Date();
  var exp = Math.floor((now - tokenDateTime) / 1000 / 60);
  // if (cherwellToken === "") {
  if (exp > 10) {
    // getCherwellToken();
    // console.log("await token needed if displayed before request comes back");

    var tokenized = await localCherwellToken();
    console.log("local cherwell auth token updated: ", tokenized);
    if(tokenized){
      console.log("Going to fetch all the customers basic info now");
      var del = await deleteChCustBasic();
      console.log("back in getCherwellBasic func ", del);
      if (del.ok == 1) {
        var data = await getBasicCustInfo();

        if(isEmpty(data)){
          res.json({ success: false, error: data })
        }

        CherwellCustBasic.insertMany(data)
          .then(response => {
            console.log("/updateSchema");
            res.status(200).send({ success: true, data: data, message: "Inserted updated basic cherwell customer information" });
            // return res.json({ success: true, data: data, message: "Inserted new doc" });
          })
          .catch(err => {
            console.log(err);
            res.status(400).send({ success: false, data: {}, message: "Failed to update table with cherwell queried info" });
          });
      }
    } else {
      console.log("something went wrong getting token from cherwell and tokenized is not set", tokenized);
      return res.json({ success: false, error: del.message });
    }

  } else {
    var del = await deleteChCustBasic();
    if (del) {
      var data = await getBasicCustInfo();

      if(isEmpty(data)){
        res.json({ success: false, error: data })
      }

      CherwellCustBasic.insertMany(data)
        .then(response => {
          console.log("/updateSchema");
          res
            .status(200)
            .send({
              success: true,
              data: data,
              message: "Inserted updated basic cherwell customer information"
            });
          // return res.json({ success: true, data: data, message: "Inserted new doc" });
        })
        .catch(err => {
          console.log(err);
          res
            .status(400)
            .send({
              success: false,
              data: {},
              message: "Failed to update table with cherwell queried info"
            });
        });
    } else {
      console.log("something went wrong, its below the refresh time for token cherwell");
      return res.json({ success: false, error: "Below refresh time but something went wrong, check logs for more details" });
    }
  }
};
/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * API API API API API API API API API
 * ~~~~~~~~~ ENDPOINTS ~~~~~~~~~~~
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
//app.post('/upload', function (req, res) {
router.post("/cherwelldoc", async (req, res) => {
  var data = new Doc();
  console.log(req.body);
  if (
    req.body.ID === "" ||
    req.body.FileName === "" ||
    req.body.Type === "" ||
    req.body.AttachmentID === "" ||
    req.body.busobid === "" ||
    req.body.busobrecid === "" ||
    req.body.AcctId === "" ||
    req.body.AcctName === "" ||
    // req.body.customer === "" ||
    // req.body.orderId === "" ||
    req.body === undefined
  ) {
    return res.status(400).json({
      error,
      message:
        "document not uploaded! Please provide all of busObId, AccountId and busObPubicId. One or many of these are empty."
    });
  } else {
    console.log("no blank data will try to get file and upload");
    // get the file from cherwell
    await pullDocFromCherwell(
      req,
      res,
      req.body.AttachmentID,
      req.body.busobid,
      req.body.busobrecid,
      req.body.FileName
    ).catch(error => {
      return res.status(400).json({
        error,
        message: "document not found!"
      });
    });
  }
});

router.post("/upload", (req, res) => {
  var data = new Doc();
  //console.log(req);
  if (req.body.cherwell) {
    if (
      req.body.dkey === "" ||
      req.body.busObId === "" ||
      req.body.AccountId === "" ||
      req.body.busObPublicId === "" ||
      // req.body.customer === "" ||
      // req.body.orderId === "" ||
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
      req.body.dkey === "" || //req.body.dkey === undefined) ||
      req.body.opid === "" || //req.body.opid === undefined) ||
      req.body.quoteid === "" || //req.body.quoteid === undefined) ||
      req.body.customer === "" || //req.body.customer === undefined) ||
      req.body.accountId === "" ||
      req.body === undefined
    ) {
      return res.status(400).json({
        error,
        message: "document not uploaded! One of the required fields were empty"
      });
    }
    // else if(
    //   !req.body.dkey || //req.body.dkey === undefined) ||
    //   !req.body.opid || //req.body.opid === undefined) ||
    //   !req.body.quoteid || //req.body.quoteid === undefined) ||
    //   !req.body.customer || //req.body.customer === undefined) ||
    //   !req.body
    // ){
    //   return res.status(400).json({
    //     error,
    //     message:
    //       "document not uploaded! One of the required fields were undefined"
    //   });
    // }
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
            "Cherwell Order", //req.body.orderId,
            "Cherwell",
            "cherwell_cust", //req.body.customer
            req.body.AccountId
          );
          postToCherwell(
            data.ogName,
            `http://10.228.19.14:3000/files/${data.name}`,
            req.body.busObId,
            req.body.busObPublicId
          );
        } else {
          updateLatest(
            data,
            false,
            req.body.dkey,
            req.body.opid,
            req.body.quoteid,
            req.body.customer,
            req.body.accountId
          );
        }
        return res.status(201).json({
          success: true,
          id: data._id,
          data: data,
          url: `http://10.228.19.14:3000/files/${data.name}`,
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
  const { source, dkey, opid, quoteid, customer, accountId } = req.body;
  Doc.findOneAndRemove({ name: source }, (err, doc, result) => {
    if (err) return res.send(err);

    console.log(doc);
    updateLatest(doc, true, dkey, opid, quoteid, customer, accountId);
    return res.json({
      success: true,
      data: doc,
      message: "document deleted!"
    });
  });
});

router.delete("/deleteAllData", (req, res) => {
  Doc.deleteMany({}, err => {
    if (err) return res.send(err);
    deleteAllFiles("public/files/");
    return res.json({ success: true, message: "All files removed from db" });
  });
});

router.delete("/deleteAllLatest", (req, res) => {
  Latest.deleteMany({}, err => {
    if (err) return res.send(err);
    return res.json({ success: true, message: "All files removed from db" });
  });
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  Doc.findOneAndDelete({ _id: id }, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

router.delete("/deleteLatest", (req, res) => {
  const { id } = req.body;
  Latest.findOneAndDelete({ _id: id }, err => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// get all the latest docs
router.get("/getLatest", (req, res) => {
  Latest.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  }).sort({ updatedAt: -1 });
});

// get all individual docs
router.get("/getAllDocs", (req, res) => {
  Doc.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  }).sort({ updatedAt: -1 });
});

// get all documents that have a specific "ogName"
router.post("/getDoc", getDocsByOg);

// get latest document that has a specific "ogName"
router.post("/getLatestByOg", getLatestByOg);

// get latest document that has a specific "ogName"
router.post("/getLatestByDkey", getLatestByDkey);

// get distinct values from document (distinct folders)
router.get("/getAllDistinct", getDistinctFromLatest);

// get distinct hash values return all sorted into hash
router.get("/getAllDkeyHash", getDistinctHashMap);

// search elastic
router.post("/search", searchByQuery);
//search by customer name via elastic
router.post("/searchChCust", searchByCustName);

// get all customers basic info from cherwell (update mongo)
router.get("/updateCustomer", getCherwellCustInfoBasic);
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
app.use("/api", router);

app.listen(API_PORT, function() {
  console.log(`App running on port ${API_PORT}`);
});
