'use strict'
const { Client } = require('whatsapp-web.js');
const express = require('express')
const qrcode = require('qrcode');
const fs = require('fs');
require('dotenv').config()
const http = require('http')
const socketIo = require('socket.io')
const moment = require('moment')
const mongoose = require('mongoose')
const hadirModel = require('./src/models/index')
const cors = require('cors')
moment.locale('id');
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const SESSION_FILE_PATH = './wasession.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

app.use(cors())

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname})
})

app.get('/data', (req, res) => {
    res.sendFile('data.html', {root: __dirname})
})

app.get('/dataabsen', (req, res) => {
    try {
        hadirModel.find()
            .then((result) => {
                res.status(200).json(result)
            })
    } catch (err) {
            console.log(err);
    }
})

const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });


client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('message', async message => {
    const tgl = moment().format('LL'); 
    const times = moment().format('LT'); 
    const chat = await message.getChat();  
    // const kodeToken = Math.floor(Math.random() * 101)
	if(message.body === 'imamin') { 
        const inputHadir = new hadirModel({
            kode: 1010,
            nama: "Imam",
            tanggal: tgl,
            masuk: times,
            status: true
        })
        inputHadir.save()
        .then((result) => {
            // console.log(result._id);
            chat.sendMessage(`Imam is Available. Info : ${tgl}`);
        })
        .catch((err) => {
            chat.sendMessage(`Ada Kesalahan`);
        })
	}else if(message.body === 'imamout') {
        const search = hadirModel.findOne({ kode: 1010, status: true }).exec()
        search.then((docs) => {
            if(docs == null) {
                chat.sendMessage(`You are not login today.`);
            }else{
                docs.keluar = times
                docs.status = false

                docs.save()
                .then((result) => {
                    chat.sendMessage(`Imam Finished working. Info : ${tgl}`);
                })
                .catch((err) => {
                    console.log(err);
                })
                
            }
        })
    }else if(message.body === "robbiin") {
        const inputHadir = new hadirModel({
            kode: 2020,
            nama: "Roby",
            tanggal: tgl,
            masuk: times,
            status: true
        })
        inputHadir.save()
        .then((result) => {
            chat.sendMessage(`Roby is Available. Info : ${tgl}`);
        })
        .catch((err) => {
            chat.sendMessage(`Ada Kesalahan`);
        })
    }else if(message.body === 'robbiout') {
        const search = hadirModel.findOne({ kode: 2020, status: true }).exec()
        search.then((docs) => {
            if(docs == null) {
                chat.sendMessage(`You are not login today.`);
            }else{
                docs.keluar = times
                docs.status = false

                docs.save()
                .then((result) => {
                    chat.sendMessage(`Robby Finished working. Info : ${tgl}`);
                })
                .catch((err) => {
                    console.log(err);
                })
                
            }
        })
    }
});

client.initialize();

// Socket
io.on('connection', (socket) => {
    socket.emit('message', 'Tunggu sampai Barcode muncul...')
    client.on('qr', (qr) => {
        // console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            // console.log(url);
            socket.emit('qr', url)
            socket.emit('message', "Silahkan Scan Whatsapp Web")
        });
    });
    client.on('ready', () => {
        socket.emit('message', "Whatsapp Telah terhubung")
    });
})

mongoose.connect(process.env.MONGODB)
.then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`Server running at port ${process.env.PORT}`);
    })
}).catch((err) => {
    console.log(err);
})

