import React, { useEffect, useState } from 'react'
import { Background } from './styled'

const Temperature = () => {
  const [city, setCity] = useState('Carregando...')
  const [temperature, setTemperature] = useState(0)
  const [error, setError] = useState(false)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords
      fetch(
        'https://us1.locationiq.com/v1/reverse.php?key=pk.f718dbffc0f842231d5fe2e844be8513&lat=' +
          latitude +
          '&lon=' +
          longitude +
          '&format=json'
      )
        .then((res) => res.json())
        .then((data) => {
          setCity(data.address.city)
          fetch(
            'https://weather.kramer.dev.br/api?location=' + data.address.city
          )
            .then((res) => res.json())
            .then((data) =>
              setTemperature(Math.round(Number(data.temperature)))
            )
        })
        .catch(() => setError(true))
    })
  }, [])

  if (error) {
    return <div>Erro ao obter a temperatura</div>
  }

  return (
    <section>
      <Background>
        <div>
          <h2>{temperature}°C</h2>
          <img src="temperature.svg" alt="temperature" />
        </div>
        <p>{city}</p>
      </Background>
    </section>
  )
}

export default Temperature
