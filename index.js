const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/database');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
var cors = require('cors');
app.use(cors({
    origin: '*'
}));

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/logo/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 

 

// create data / insert data
app.post('/api/turnamen',upload.single('logo'),(req, res) => {


    const data = { ...req.body };
     const noreg = req.body.noreg;
    const nama_tim = req.body.nama_tim;
    const tgl_pendaftaran = req.body.tgl_pendaftaran;
    const kapten = req.body.kapten;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO turnamen (noreg,nama_tim,tgl_pendaftaran,kapten) values (?,?,?,?);';
         
        // jalankan query
        koneksi.query(querySql, [noreg,nama_tim, tgl_pendaftaran,kapten], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/logo/' + req.file.filename;
        const logo =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO turnamen (noreg,nama_tim,tgl_pendaftaran,kapten,logo) values (?,?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ noreg,nama_tim, tgl_pendaftaran,kapten,logo], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/turnamen', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM turnamen';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/turnamen/:noreg', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM turnamen WHERE noreg = ?';
    const noreg = req.body.noreg;
    const nama_tim = req.body.nama_tim;
    const tgl_pendaftaran = req.body.tgl_pendaftaran;
    const kapten = req.body.kapten;

    const queryUpdate = 'UPDATE turnamen SET nama_tim=?,tgl_pendaftaran=?,kapten=? WHERE noreg = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.noreg, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama_tim,tgl_pendaftaran,kapten, req.params.noreg], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/turnamen/:noreg', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM turnamen WHERE noreg = ?';
    const queryDelete = 'DELETE FROM turnamen WHERE noreg = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.noreg, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.noreg, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));




