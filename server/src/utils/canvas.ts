import {
  createCanvas,
  loadImage,
  Canvas,
  CanvasRenderingContext2D,
  ImageData,
} from 'canvas'
import { WIDTH, HEIGHT, GENERATED_IMAGES_PATH } from './constants'
import fs from 'fs'
import path from 'path'

export async function initCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  // Load the world map image onto the canvas
  const image = await loadImage(path.resolve(`public/images/empty-map.jpg`))
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT)

  // Get the image data from the canvas
  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  const data = imageData.data

  return { ctx, imageData, data, canvas }
}

export function generateImage(
  fileName: string,
  canvas: Canvas,
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
) {
  return new Promise((resolve, reject) => {
    const generatedImagesDir = path.resolve(GENERATED_IMAGES_PATH)
    if (!fs.existsSync(generatedImagesDir)) {
      fs.mkdirSync(generatedImagesDir, { recursive: true }) // Create the directory if it doesn't exist
    }

    ctx.putImageData(imageData, 0, 0)
    const imgPath = path.join(GENERATED_IMAGES_PATH, fileName)
    const outStream = fs.createWriteStream(path.resolve(imgPath))
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
