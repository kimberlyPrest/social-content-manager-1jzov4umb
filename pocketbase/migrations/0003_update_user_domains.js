migrate(
  (app) => {
    const usersToUpdate = [
      { old: 'admin@supremoaroma.com', new: 'admin@supremoaroma.com.br' },
      { old: 'criador@supremoaroma.com', new: 'criador@supremoaroma.com.br' },
      { old: 'analista@supremoaroma.com', new: 'analista@supremoaroma.com.br' },
    ]

    for (const pair of usersToUpdate) {
      try {
        const record = app.findAuthRecordByEmail('users', pair.old)
        record.setEmail(pair.new)
        app.save(record)
      } catch (_) {
        // User with old email not found or already updated
      }
    }
  },
  (app) => {
    const usersToRevert = [
      { old: 'admin@supremoaroma.com', new: 'admin@supremoaroma.com.br' },
      { old: 'criador@supremoaroma.com', new: 'criador@supremoaroma.com.br' },
      { old: 'analista@supremoaroma.com', new: 'analista@supremoaroma.com.br' },
    ]

    for (const pair of usersToRevert) {
      try {
        const record = app.findAuthRecordByEmail('users', pair.new)
        record.setEmail(pair.old)
        app.save(record)
      } catch (_) {
        // User with new email not found
      }
    }
  },
)
