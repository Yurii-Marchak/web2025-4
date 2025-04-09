const { Command } = require('commander');
const http = require('http');
const https = require('https');
const js2xmlparser = require('js2xmlparser');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Host (server address)')
  .requiredOption('-p, --port <port>', 'Port (server port)');

program.parse(process.argv);
const options = program.opts();

const host = options.host;
const port = parseInt(options.port);

const NBU_API_URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

const server = http.createServer((req, res) => {
  https.get(NBU_API_URL, (apiRes) => {
    let data = '';

    apiRes.on('data', chunk => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);

        const exchangeArray = jsonData.map(item => ({
          date: item.exchangedate,
          rate: item.rate,
          currency: item.txt
        }));

        const xmlData = js2xmlparser.parse("data", { exchange: exchangeArray });

        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(xmlData);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to parse NBU data');
      }
    });

  }).on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed to fetch NBU data');
  });
});

server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});
