const mongoose = require('mongoose');
const mongoosastic = require("mongoosastic");
const Schema = mongoose.Schema

const Document = new Schema(
    {
        id: {type: Number},
        ogName: { type: String, required: true },
        name: { type: String, required: true },
        // rating: { type: Number, required: true },
    },
    { timestamps: true },
)


Document.plugin(mongoosastic, {
    "host": "10.228.19.14",
    "port": 8200
  });

module.exports = mongoose.model('files', Document);
