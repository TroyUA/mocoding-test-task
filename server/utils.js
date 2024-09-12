const fs = require('fs')
const { loadImage, createCanvas } = require('canvas')
const AdmZip = require('adm-zip')
const unzipper = require('unzipper')

const {
  BINARY_DIMENSION_X,
  BINARY_DIMENSION_Y,
  RESOLUTION,
  WIDTH,
  HEIGHT,
} = require('./constants')
const { temperatureToColor } = require('./color')

async function processImage() {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  // Load the world map image onto the canvas
  const image = await loadImage(`${__dirname}/public/images/empty-map.jpg`)
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT)

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  const data = imageData.data

  // Create a read stream for the binary temperature data
  const tempStream = fs.createReadStream(`${__dirname}/extracted/sst.grid`, {
    highWaterMark: BINARY_DIMENSION_X,
  })

  let chunkIndex = 0
  let tempArr = []
  // Stream data chunk handler
  tempStream.on('data', (chunk) => {
    if (chunkIndex % RESOLUTION === 0) {
      let row = []
      for (let i = 0; i < chunk.length; i += RESOLUTION) {
        row.push(chunk[i])
      }
      tempArr.push(row)
    }
    chunkIndex++
  })
  // Handle the end of the temperature data stream
  tempStream.on('end', async () => {
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
    console.log('Finished processing temperature data.')

    // Apply the modified image data to the canvas
    ctx.putImageData(imageData, 0, 0)

    const outStream = fs.createWriteStream(
      `${__dirname}/public/images/updated-world-map.jpeg`
    )
    const jpegStream = canvas.createJPEGStream()

    jpegStream.pipe(outStream)

    outStream.on('finish', () => {
      console.log('The updated JPEG file was saved.')
    })
  })

  // Handle errors in the stream
  tempStream.on('error', (err) => {
    console.error('Error reading temperature data:', err)
  })
}

function extractFile(from, to) {
  const zip = new AdmZip(from)
  const zipEntries = zip.getEntries()
  zipEntries.forEach((entry) => {
    if (entry.entryName.endsWith('.grid')) {
      zip.extractEntryTo(entry, to, true, true)
    }
  })
}

async function generateJpegFromZippedGrid(zipFilePath) {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  // Load the world map image onto the canvas
  const image = await loadImage(`${__dirname}/public/images/empty-map.jpg`)
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT)

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  const data = imageData.data

  fs.createReadStream(zipFilePath)
    .pipe(unzipper.Parse())
    .on('entry', async (entry) => {
      const fileName = entry.path
      const type = entry.type // 'Directory' or 'File'
      const size = entry.vars.uncompressedSize

      if (
        type === 'File' &&
        fileName.endsWith('.grid') &&
        size === BINARY_DIMENSION_X * BINARY_DIMENSION_Y
      ) {
        console.log(`Extracting: ${fileName} (${size} bytes)`)

        let chunkIndex = 0
        let bufferedData = Buffer.alloc(0)
        let tempArr = []

        entry.on('data', (chunk) => {
          bufferedData = Buffer.concat([bufferedData, chunk])
          while (bufferedData.length >= BINARY_DIMENSION_X) {
            const chunkToProcess = bufferedData.subarray(0, BINARY_DIMENSION_X)
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
          console.log('Finished processing temperature data.')

          // Apply the modified image data to the canvas
          ctx.putImageData(imageData, 0, 0)

          const outStream = fs.createWriteStream(
            `${__dirname}/public/images/generated/${
              fileName.split('.')[0]
            }.jpeg`
          )
          const jpegStream = canvas.createJPEGStream()

          jpegStream.pipe(outStream)

          outStream.on('finish', () => {
            console.log('The updated JPEG file was saved.')
          })
        })
      } else {
        entry.autodrain()
      }
    })
    .on('error', (err) => {
      console.error('Error while extracting ZIP:', err)
    })
}

;(async () => {
  const zipFilePath = 'uploads/sst.grid.zip'

  generateJpegFromZippedGrid(zipFilePath)
})()

module.exports = {
  processImage,
  extractFile,
  generateJpegFromZippedGrid,
}
