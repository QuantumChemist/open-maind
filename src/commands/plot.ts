import nodeHtmlToImage from 'node-html-to-image';
import path from 'path';

export async function generatePlotImage(
  xData: number[],
  yData: number[],
  title = 'openmAInd Plot'
): Promise<string> {
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
            title: '${title}'
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
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return outputPath; // letse see 
}
