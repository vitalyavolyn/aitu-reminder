const { Keyboard, StepScene } = require('aitu')
// const moment = require('moment-timezone')

const Reminder = require('./models/Reminder')

module.exports = new StepScene('list', [
  async ctx => {
    const n = Number(ctx.text)
    const invalid = Number.isNaN(n) || n <= 0
    const reminders = await Reminder.find({ user: ctx.sender.id })

    if (invalid) {
      if (!reminders.length) {
        ctx.send('У вас нет напоминаний')
        return ctx.scene.leave()
      }

      if (ctx.scene.step.firstTime) ctx.send('Все ваши напоминания:')

      let list = ''
      reminders.forEach((e, i) => (list += `${i + 1}. ${e.note}\n`))
      ctx.send(list)
      return ctx.send('Для удаления из списка отправьте номер напоминания.', {
        inlineCommandRows: Keyboard.builder()
          .inlineCommand({ caption: 'Выйти', metadata: 'cancel' })
      })
    }

    await reminders[n - 1].remove()
    ctx.send('🗑️ Удалено!')

    ctx.text = ''
    return ctx.scene.reenter()
  }
])
