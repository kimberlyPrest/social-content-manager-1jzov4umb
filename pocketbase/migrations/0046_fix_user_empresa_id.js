migrate(
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'eduardo@supremoaroma.com.br')
      user.set('empresa_id', 'b2m5wf6nnaphxat')
      app.saveNoValidate(user)
    } catch (_) {
      // Skip if user does not exist
    }
  },
  (app) => {
    // Revert not strictly necessary as it resolves a missing relation
  },
)
