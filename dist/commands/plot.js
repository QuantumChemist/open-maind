"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlotImage = generatePlotImage;
const node_html_to_image_1 = __importDefault(require("node-html-to-image"));
const path_1 = __importDefault(require("path"));
async function generatePlotImage(xData, yData, title = 'openmAInd Plot') {
    // Validate inputs
    if (!Array.isArray(xData) || !xData.every(n => typeof n === 'number')) {
        throw new TypeError('xData must be an array of numbers');
    }
    if (!Array.isArray(yData) || !yData.every(n => typeof n === 'number')) {
        throw new TypeError('yData must be an array of numbers');
    }
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      </head>
      <body>
        <div id="plot" style="width:600px;height:400px;"></div>
        <script>
          Plotly.newPlot('plot', [{
            x: ${JSON.stringify(xData)},
            y: ${JSON.stringify(yData)},
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' }
          }], {
            title: ${JSON.stringify(title)}
          });
        </script>
      </body>
    </html>
  `;
    const outputPath = path_1.default.resolve('./plot.png');
    await (0, node_html_to_image_1.default)({
        output: outputPath,
        html,
        type: 'png',
        quality: 100,
        puppeteerArgs: {
            executablePath: '/usr/bin/chromium-browser', // <- use '/usr/bin/chromium' if this doesn't exist
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
    });
    return outputPath;
}
