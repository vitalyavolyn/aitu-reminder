const mongoose = require('mongoose')

const { Schema } = mongoose

const reminderSchema = new Schema({
  note: {
    type: String,
    required: true,
    maxlength: 1000
  },
  fireTime: {
    type: Date,
    required: true
  },
  user: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Reminder', reminderSchema)
