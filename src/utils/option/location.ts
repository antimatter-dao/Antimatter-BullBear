import wrapPromise from './wrapPromise'

export const fetchLocation = () => {
  return wrapPromise(
    fetch('https://geolocation-db.com/json/')
      .then(r => r.clone().json())
      .then(json => json.country_code)
      .catch(e => {
        console.error(e)
      })
  )
}
