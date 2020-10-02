const { Aitu, session, Stage } = require('aitu')
const mongoose = require('mongoose')
const dialogflow = require('@google-cloud/dialogflow')
const moment = require('moment-timezone')
const { scheduleJob } = require('node-schedule')
const { struct } = require('pb-util')

const User = require('./models/User')
const Reminder = require('./models/Reminder')
const chooseTimezone = require('./chooseTimezone')
const list = require('./list')
const sendReminders = require('./sendReminders')
const { connectionString, dialogflowId, token } = require('../config')

moment.locale('ru')

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = global.Promise
mongoose.connection.on('error', console.error)

const aitu = new Aitu({ token })

const { updates } = aitu

const stage = new Stage()

stage.addScenes([chooseTimezone, list])

updates.use(session())
updates.use(stage.middleware)

updates.on('Message', async (ctx, next) => {
  let user = await User.findOne({ id: ctx.sender.id })
  if (!user) {
    user = new User({ id: ctx.sender.id })
    await user.save()
    await ctx.send('Привет! Для начала настроим часовой пояс.')
    ctx.state.user = user
    return ctx.scene.enter('chooseTimezone')
  }
  ctx.state.user = user

  next()
})

updates.use(async (ctx, next) => {
  if (ctx.isCommand || ctx.metadata) {
    if (!ctx.text && ctx.metadata) ctx.text = `/${ctx.metadata}`

    switch (ctx.text) {
      case '/tz':
        return ctx.scene.enter('chooseTimezone')
      case '/list':
        return ctx.scene.enter('list')
      case '/cancel':
        ctx.scene.leave({
          canceled: true
        })
        return ctx.send('Готово!')
      default:
        next()
    }
  } else next()
})

updates.use(stage.sceneMiddleware)

updates.on('Message', async ctx => {
  if (!ctx.hasText) {
    return ctx.send('Отвечаю только на сообщения с текстом.')
  }

  const sessionClient = new dialogflow.SessionsClient()
  const sessionPath = sessionClient.projectAgentSessionPath(dialogflowId, ctx.sender.id)

  // console.log(ctx)

  const request = {
    session: sessionPath,
    queryParams: {
      timeZone: ctx.state.user.timezone
    },
    queryInput: {
      text: {
        text: ctx.text,
        languageCode: 'ru'
      }
    }
  }

  const responses = await sessionClient.detectIntent(request)
  const result = responses[0].queryResult

  // console.log(result)
  if (result.fulfillmentText) {
    return ctx.send(result.fulfillmentText)
  } else if (result.action === 'input.addReminder' && result.allRequiredParamsPresent) {
    const { time, text } = struct.decode(result.parameters)

    let date = typeof time === 'string'
      ? time
      : time.startDate || time.startTime || time.date_time || time.startDateTime
    // https://cloud.google.com/dialogflow/docs/reference/system-entities#ex

    const reminder = new Reminder({ fireTime: new Date(date), note: text, user: ctx.sender.id })
    reminder.save()

    date = moment.tz(date, ctx.state.user.timezone)

    let timeString = ''
    if (moment().isSame(date, 'day')) {
      timeString += 'сегодня'
    } else if (moment().add(1, 'day').isSame(time, 'day')) {
      timeString += 'завтра'
    } else {
      timeString += time.format('DD MMMM')
    }

    const emoji = ['👍', '✔️', '🎉', '🎊']

    ctx.send(`${emoji[~~(emoji.length * Math.random())]} Хорошо! Напомню ${timeString} в ${date.format('HH:mm')}`)
  }
})

updates.startPolling()

scheduleJob('0,30 * * * * *', sendReminders)
