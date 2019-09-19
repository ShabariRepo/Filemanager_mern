const mongoose = require('mongoose')
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

module.exports = mongoose.model('files', Document)