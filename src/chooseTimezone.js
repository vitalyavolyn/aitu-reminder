const { StepScene, Keyboard } = require('aitu')
const moment = require('moment-timezone')

const getTimezoneByCityName = require('./getTimezoneByCityName')

module.exports = new StepScene('chooseTimezone', [
  async ctx => {
    if (ctx.metadata && ctx.metadata === 'exit') {
      ctx.send('👌 Теперь вы готовы пользоваться ботом!')
      return ctx.scene.leave()
    }

    if (ctx.scene.step.firstTime) {
      const { timezone } = ctx.state.user
      const message = `Ваш нынешний часовой пояс: ${timezone} (сейчас ${moment().tz(timezone).format('HH:mm')})\n` +
        'Если вы хотите его изменить, отправьте мне имя своего города'
      return ctx.send(message, {
        inlineCommandRows: Keyboard.builder().inlineCommand({ caption: 'Готово', metadata: 'exit' })
      })
    }

    const timeZone = await getTimezoneByCityName(ctx.text)
    ctx.state.user.timezone = timeZone
    await ctx.state.user.save()
    ctx.send(`👌 Новый пояс: ${timeZone} (сейчас ${moment().tz(timeZone).format('HH:mm')})`)

    return ctx.scene.leave()
  }
])
