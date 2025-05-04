import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

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
            title: ${JSON.stringify(title)}
          });
        </script>
      </body>
    </html>
  `;

  const outputPath = path.resolve('./plot.png');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium', // or chromium-browser if needed
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 400 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const plotElement = await page.$('#plot');
  if (!plotElement) throw new Error('Plot element not found');

  await plotElement.screenshot({ path: outputPath });
  await browser.close();

  return outputPath;
}
