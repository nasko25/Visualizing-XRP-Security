import express from 'express';
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'pass'
})

// connection.connect(function(err: Error) {
//     if (err) {console.log('error', err); throw err;}
//     console.log("Connected!");
// });

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
})

app.get('/bruh', (req, res) => {
    // res.send('bruh');
    // connection.connect(function(err:Error) {
    //     if(err) {
    //         console.log('error', err);
    //         res.send('error connecting to db' + err);
    //         // throw err;
    //     }
    //     res.send('Success. connected to db');
    // })
    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error: Error, results: any, fields: any) {
        if (error) { res.send('not nice'); throw error} ;
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
})

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
})
