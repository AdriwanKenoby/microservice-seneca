var seneca = require('seneca')()
.use('basic')
.use('entity')
.use('engine')
.use('seneca-repl', {port: 10023})
.listen({ type: 'tcp', port: 9005, pin: 'role:engine' })
