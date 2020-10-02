const { createClient } = require('@google/maps')
const { googleMapsKey } = require('../config')

const googleMapsClient = createClient({
  key: googleMapsKey, Promise
})

module.exports = async (lat, long) => {
  const timezoneInfo = await googleMapsClient.timezone({
    location: [lat, long]
  }).asPromise()
  console.log(timezoneInfo.json.timeZoneId)

  const { timeZoneId } = timezoneInfo.json
  return timeZoneId
}
