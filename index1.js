const http = require('http');
const fs = require('fs/promises');
const { create } = require('xmlbuilder2');
const { Command } = require('commander');

const program = new Command();

program
  .requiredOption('-h, --host <type>', 'Адреса сервера')
  .requiredOption('-p, --port <number>', 'Порт сервера')
  .requiredOption('-i, --input <path>', 'Шлях до JSON-файлу');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer(async (req, res) => {
  try {
    const content = await fs.readFile(options.input, 'utf-8');
    const jsonData = JSON.parse(content);

    const exchangeList = Array.isArray(jsonData) ? jsonData : [jsonData];

    const xml = create({ version: '1.0' })
      .ele('data');

    for (const entry of exchangeList) {
      if (entry.exchangedate && entry.rate) {
        xml.ele('excgange')
          .ele('date').txt(entry.exchangedate).up()
          .ele('rate').txt(entry.rate).up()
        .up();
      }
    }

    const xmlString = xml.end({ prettyPrint: true });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xmlString);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end("Помилка сервера: " + err.message);
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер слухає на http://${options.host}:${options.port}`);
});
