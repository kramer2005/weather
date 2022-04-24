import React, { useEffect, useState } from 'react'

const Temperature = () => {
  const [state, setState] = useState('Loading...')

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
        .then((data) =>
          fetch('api?location=' + data.address.city)
            .then((res) => res.json())
            .then((data) => setState(data.temperature))
        )
    })
  }, [])
  return <div>{state}</div>
}

export default Temperature
