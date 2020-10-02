const { createClient } = require('@google/maps')
const { googleMapsKey } = require('../config')
const timeZoneInfo = require('./timeZoneInfo')

const googleMapsClient = createClient({
  key: googleMapsKey, Promise
})

module.exports = async function (city) {
  const res = await googleMapsClient.geocode({ address: city }).asPromise()
  if (!res.json.results.length) return 'Asia/Almaty'
  const { location } = res.json.results[0].geometry
  return timeZoneInfo(location.lat, location.lng)
}
