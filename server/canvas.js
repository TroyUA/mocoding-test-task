const { createCanvas, loadImage } = require('canvas')
const { WIDTH, HEIGHT } = require('./constants')

async function initCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  // Load the world map image onto the canvas
  const image = await loadImage(`${__dirname}/public/images/empty-map.jpg`)
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT)

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  const data = imageData.data

  return { canvas, ctx, image, imageData, data }
}

module.exports = { initCanvas }
