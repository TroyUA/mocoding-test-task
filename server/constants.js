const BINARY_DIMENSION_X = 36000
const BINARY_DIMENSION_Y = 17999
const RESOLUTION = 10
const WIDTH = BINARY_DIMENSION_X / RESOLUTION
const HEIGHT = BINARY_DIMENSION_Y / RESOLUTION

const GENERATED_IMAGES_PATH = '/public/images/generated/'

module.exports = {
  BINARY_DIMENSION_X,
  BINARY_DIMENSION_Y,
  RESOLUTION,
  WIDTH,
  HEIGHT,
  GENERATED_IMAGES_PATH,
}
