const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'Asia/Almaty'
  }
})

module.exports = mongoose.model('User', userSchema)
