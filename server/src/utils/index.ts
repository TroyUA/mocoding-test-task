import fs from 'fs'
import path from 'path'
import unzipper from 'unzipper'

import { BINARY_DIMENSION_X, BINARY_DIMENSION_Y, RESOLUTION } from './constants'
import { temperatureToColor } from './color'
import { initCanvas, generateImage } from './canvas'

export async function generateJpegFromZippedGrid(zipFilePath: string) {
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
          let tempArr: number[][] = []
          let minTemp: number
          let maxTemp: number

          entry.on('data', (chunk: Buffer) => {
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
                  if (chunkToProcess[i] < 255) {
                    if (
                      typeof minTemp === 'undefined' ||
                      chunkToProcess[i] < minTemp
                    )
                      minTemp = chunkToProcess[i]

                    if (
                      typeof maxTemp === 'undefined' ||
                      chunkToProcess[i] > maxTemp
                    )
                      maxTemp = chunkToProcess[i]
                  }
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
                  const [r, g, b] = temperatureToColor(
                    temperature,
                    minTemp,
                    maxTemp
                  )

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
