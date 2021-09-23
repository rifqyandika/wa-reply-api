const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Hadir = new Schema({
    kode: {
        type: Number,
        required: true
    },
    nama: {
        type: String,
        required: true
    },
    tanggal: {
        type: String,
        required: true
    },
    masuk: {
        type: String,
        required: true
    },
    keluar: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Hadir', Hadir)