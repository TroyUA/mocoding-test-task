import styles from './WaterTemperatureMap.module.css'

type WaterTemperatureMapProps = {
  imgUrl: string
}

export function WaterTemperatureMap(props: WaterTemperatureMapProps) {
  return (
    <div>
      <img src={props.imgUrl} className={styles.image} />
    </div>
  )
}
