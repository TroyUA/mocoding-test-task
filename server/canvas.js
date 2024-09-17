const { createCanvas, loadImage } = require('canvas')
const { WIDTH, HEIGHT, GENERATED_IMAGES_PATH } = require('./constants')
const fs = require('fs')
const path = require('path')

async function initCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  // Load the world map image onto the canvas
  const image = await loadImage(`${__dirname}/public/images/empty-map.jpg`)
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT)

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  const data = imageData.data

  return { ctx, imageData, data, canvas }
}

function generateImage(fileName, canvas, ctx, imageData) {
  return new Promise((resolve, reject) => {
    console.log('Finished processing temperature data.')

    // Apply the modified image data to the canvas
    ctx.putImageData(imageData, 0, 0)
    const imgPath = `${GENERATED_IMAGES_PATH}${fileName}`

    const outStream = fs.createWriteStream(path.join(__dirname, imgPath))
    canvas.createJPEGStream().pipe(outStream)

    outStream.on('finish', () => {
      console.log(`The generated ${fileName} was saved.`)
      resolve(imgPath)
    })
    outStream.on('error', (err) => {
      reject(err)
    })
  })
}
module.exports = { initCanvas, generateImage }
