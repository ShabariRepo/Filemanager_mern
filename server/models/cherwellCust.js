const mongoose = require("mongoose");
const mongoosastic = require("mongoosastic");
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const CherwellCustBasic = new Schema(
  {
    busObId: {type: String},
    busObPublicId: { type: String, required: true },
    busObRecId: { type: String, required: true },
    fields: { type: [Object], default: []},
    links: {type: [Object], default: []},
    errorCode: {type: String},
    errorMessage: {type: String},
    hasError: {type: Boolean, default: false}
  },
  { timestamps: true }
);

CherwellCustBasic.plugin(mongoosastic, {
  "host": "10.228.19.14",
  "port": 9200
});
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("CherwellCustBasic", CherwellCustBasic);
