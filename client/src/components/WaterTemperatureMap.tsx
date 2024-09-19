import { SERVER_URL } from '../constants'
import styles from './WaterTemperatureMap.module.css'

type WaterTemperatureMapProps = {
  imgPath: string
}

export function WaterTemperatureMap(props: WaterTemperatureMapProps) {
  return (
    <div>
      <img src={`${SERVER_URL}${props.imgPath}`} className={styles.image} />
    </div>
  )
}
