const { Command } = require('commander');
const fs = require('fs');
const http = require('http');
const path = require('path');

const program = new Command();

program
  .requiredOption('-h, --host <type>', 'Адреса сервера')
  .requiredOption('-p, --port <number>', 'Порт сервера')
  .requiredOption('-i, --input <path>', 'Шлях до JSON-файлу');

program.parse(process.argv);

const options = program.opts();

// Перевірка, чи існує файл
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

// Читання JSON
let jsonData = null;
try {
  const content = fs.readFileSync(options.input, 'utf8');
  jsonData = JSON.parse(content);
} catch (err) {
  console.error("Помилка при читанні або парсингу JSON:", err.message);
  process.exit(1);
}

// Створення сервера
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(jsonData, null, 2));
});

// Запуск сервера
server.listen(options.port, options.host, () => {
  console.log(`Сервер працює на http://${options.host}:${options.port}`);
});

