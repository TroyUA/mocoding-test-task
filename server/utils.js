const fs = require('fs/promises')
const { loadImage, createCanvas } = require('canvas')
const AdmZip = require('adm-zip')

const { BINARY_DIMENSION_X, BINARY_DIMENSION_Y } = require('./constants')

const RESOLUTION = 10
const WIDTH = BINARY_DIMENSION_X / RESOLUTION
const HEIGHT = BINARY_DIMENSION_Y / RESOLUTION

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
  const fileHandleRead = await fs.open(`${__dirname}/extracted/sst.grid`, 'r')
  const tempStream = fileHandleRead.createReadStream({
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
          // Convert the temperature to RGB color
          const [r, g, b] = temperatureToColor(temperature)

          // Update the image pixel data
          data[index * 4] = r // Red
          data[index * 4 + 1] = g // Green
          data[index * 4 + 2] = b // Blue
          // Alpha (data[index * 4 + 3]) remains unchanged
        }
      })
    console.log('Finished processing temperature data.')

    // Apply the modified image data to the canvas
    ctx.putImageData(imageData, 0, 0)

    // Create a write stream for the output image
    const outHandleWrite = await fs.open(
      `${__dirname}/public/images/updated-world-map.jpeg`,
      'w'
    )
    const outStream = outHandleWrite.createWriteStream()
    const jpegStream = canvas.createJPEGStream()

    // Pipe the JPEG stream to the output file
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

function interpolateColor(color1, color2, factor) {
  return [
    Math.round(color1[0] + factor * (color2[0] - color1[0])),
    Math.round(color1[1] + factor * (color2[1] - color1[1])),
    Math.round(color1[2] + factor * (color2[2] - color1[2])),
  ]
}

function temperatureToColor(temperature) {
  const colorStops = [
    [0, 0, 255], // Blue (Coldest)
    [0, 255, 255], // Aqua
    [0, 255, 0], // Green
    [255, 255, 0], // Yellow
    [255, 165, 0], // Orange (Warmest)
  ]

  const minTemp = 30 // Coldest temperature, adjust as needed
  const maxTemp = 100 // Warmest temperature, adjust as needed

  // Calculate the range of temperatures and divide into four segments
  const tempRange = maxTemp - minTemp
  const segmentSize = tempRange / (colorStops.length - 1)

  // Find which segment the temperature falls into
  const segmentIndex = Math.floor((temperature - minTemp) / segmentSize)

  // Ensure the segment index stays within bounds
  const clampedSegmentIndex = Math.max(
    0,
    Math.min(segmentIndex, colorStops.length - 2)
  )

  // Calculate the interpolation factor within the segment
  const segmentStartTemp = minTemp + clampedSegmentIndex * segmentSize
  const factor = (temperature - segmentStartTemp) / segmentSize

  // Interpolate between the two colors of the segment
  const color1 = colorStops[clampedSegmentIndex]
  const color2 = colorStops[clampedSegmentIndex + 1]

  return interpolateColor(color1, color2, factor)
}

function extractFile(from, to) {
  const zip = new AdmZip(from)
  const zipEntries = zip.getEntries()
  zipEntries.forEach((entry) => {
    if (entry.entryName === 'sst.grid') {
      zip.extractEntryTo(entry, to, true, true)
    }
  })
}

module.exports = { processImage, extractFile }
