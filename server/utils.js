const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')

const {
  BINARY_DIMENSION_X,
  BINARY_DIMENSION_Y,
  RESOLUTION,
} = require('./constants')
const { temperatureToColor } = require('./color')
const { initCanvas, generateImage } = require('./canvas')

async function generateJpegFromZippedGrid(zipFilePath) {
  const { canvas, ctx, imageData, data } = await initCanvas()

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        const fileName = entry.path
        const type = entry.type // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize

        if (
          type === 'File' &&
          fileName.endsWith('.grid') &&
          size === BINARY_DIMENSION_X * BINARY_DIMENSION_Y
        ) {
          console.log(`Extracting: ${fileName}`)

          let chunkIndex = 0
          let bufferedData = Buffer.alloc(0)
          let tempArr = []

          entry.on('data', (chunk) => {
            bufferedData = Buffer.concat([bufferedData, chunk])
            while (bufferedData.length >= BINARY_DIMENSION_X) {
              const chunkToProcess = bufferedData.subarray(
                0,
                BINARY_DIMENSION_X
              )
              bufferedData = bufferedData.subarray(BINARY_DIMENSION_X)
              if (chunkIndex % RESOLUTION === 0) {
                let row = []
                for (let i = 0; i < chunkToProcess.length; i += RESOLUTION) {
                  row.push(chunkToProcess[i])
                }
                tempArr.push(row)
              }
              chunkIndex++
            }
          })

          entry.on('end', async () => {
            tempArr
              .reverse()
              .flat()
              .forEach((temperature, index) => {
                if (temperature !== 255) {
                  const [r, g, b] = temperatureToColor(temperature)

                  data[index * 4] = r
                  data[index * 4 + 1] = g
                  data[index * 4 + 2] = b
                }
              })

            try {
              const imgPath = await generateImage(
                `${path.basename(zipFilePath, path.extname(zipFilePath))}.jpeg`,
                canvas,
                ctx,
                imageData
              )

              resolve(imgPath)
            } catch (err) {
              reject(err)
            }
          })
        } else {
          entry.autodrain()
        }
      })
      .on('error', (err) => {
        console.error('Error while extracting ZIP:', err)
        reject(err)
      })
  })
}

module.exports = {
  generateJpegFromZippedGrid,
}
