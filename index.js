const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-i, --input <path>', 'шлях до вхідного файлу (обовʼязковий)')
  .option('-o, --output <path>', 'шлях до вихідного файлу')
  .option('-d, --display', 'вивести результат у консоль');

program.parse(process.argv);
const options = program.opts();

if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

// Перевіряємо існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Читаємо JSON
const data = JSON.parse(fs.readFileSync(options.input, 'utf-8'));

// Знаходимо всі значення rate, якщо є поле txt = Золото
const goldRates = data
  .filter(entry => entry.txt === 'Золото')
  .map(entry => entry.rate);

if (goldRates.length === 0) {
  process.exit(0); // якщо немає золота — нічого не виводимо
}

const maxRate = Math.max(...goldRates);
const result = `Максимальний курс: ${maxRate}`;

// Виводимо згідно з параметрами
if (options.output) {
  fs.writeFileSync(options.output, result, 'utf-8');
}
if (options.display) {
  console.log(result);
}
