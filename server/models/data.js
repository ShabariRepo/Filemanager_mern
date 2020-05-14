const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const Latest = new Schema(
  {
    id: {type: Number},
    ogName: { type: String, required: true },
    latestName: { type: String, required: true },
    fileBsonId: { type: String, required: true},
    dkey: {type: String, required: true},
    opid: {type: String, required: true},
    quoteid: {type: String, required: true},
    customer: {type: String, required: false},
    accountId: {type: String, required: false},
    revisions: { type: Number, default: 0 },
    versions: { type: [String], required: true },
  },
  { timestamps: true }
);

Latest.plugin(mongoosastic, {
  "host": "10.228.19.14",
  "port": 9200
});
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("latest", Latest);
