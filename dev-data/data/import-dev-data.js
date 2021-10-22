const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB is conected'));
///read json file
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')
);
///import data into DB
const importDatat = async () => {
    try {
        await Tour.create(tours);
        console.log('data is sucssec fuly loded');
    } catch (err) {
        console.log(err);
    }
};
////delet data from data base
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('data is sucssec fuly deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};
if (process.argv[2] === '--import') {
    importDatat();
} else if (process.argv[2] === '--delete') deleteData();
