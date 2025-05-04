import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';

export async function generatePlotImage(
  xData: number[],
  yData: number[],
  title = 'openmAInd Plot'
): Promise<string> {
  if (
    !Array.isArray(xData) ||
    !Array.isArray(yData) ||
    !xData.every(n => typeof n === 'number') ||
    !yData.every(n => typeof n === 'number')
  ) {
    throw new Error('xData and yData must be arrays of numbers');
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

  const outputPath = path.resolve('./plot.png');

  await nodeHtmlToImage({
    output: outputPath,
    html,
    type: 'png',
    quality: 100,
    puppeteerArgs: {
      executablePath: '/usr/bin/chromium', 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return outputPath; // ✅ ensures return type Promise<string>
}
