import express from 'express';
import Crawler from './crawl'

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
});

async function startCrawler() {
    // TODO get the ripple server links from a file
    //let crawler = new Crawler(["wss://s1.ripple.com"]);
    let crawler = new Crawler([]);
}
startCrawler().catch((e) => {
    console.log(`Crawler exited with the exception: ${e}.`);
});
app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
});
