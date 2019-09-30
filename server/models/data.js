const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const Latest = new Schema(
  {
    id: {type: Number},
    ogName: { type: String, required: true },
    latestName: { type: String, required: true },
    fileBsonId: { type: String, required: true},
    revisions: { type: Number, default: 0 },
    versions: { type: [String], required: true },
  },
  { timestamps: true }
);

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("latest", Latest);