import express from 'express';
import Crawler from './crawl'
import { promises as fs } from 'fs';

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
});

async function startCrawler() {
    // read a list of ripple server urls from the config file, and split them by one or more spaces or new lines
    let rippleServersArr = (await fs.readFile('config/ripple_servers.list','utf8')).split(/[\s|\n]+/);

    // remove the empty last line
    rippleServersArr.splice(-1, 1);
    console.log(rippleServersArr);
    let crawler = new Crawler(rippleServersArr);
}
startCrawler().catch((e) => {
    console.log(`Crawler exited with the exception: ${e}.`);
});
app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
});
