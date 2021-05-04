import express from 'express';
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass'
})

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!' + mysql);
})

app.get('/connect-db', (req, res) => {
    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error: Error, results: any, fields: any) {
        if (error) { res.send('not nice'); throw error} ;
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
    res.end();
})

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
})
