const http = require('http');
const { Command } = require('commander');
const fs = require('fs/promises');
const js2xmlparser = require("js2xmlparser");

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-i, --input <file>', 'Шлях до вхідного JSON файлу');

program.parse(process.argv);
const options = program.opts();

// Створення HTTP-сервера
const server = http.createServer(async (req, res) => {
  try {
    const file = await fs.readFile(options.input, 'utf-8');
    const json = JSON.parse(file);

    // Мапимо JSON у формат, що підходить для XML
    const xmlData = {
      excgange: json.map(item => ({
        date: item.exchangedate,
        rate: item.rate
      }))
    };

    const xml = js2xmlparser.parse("data", xmlData);
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end("Помилка читання або обробки файлу");
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер працює на http://${options.host}:${options.port}`);
});
