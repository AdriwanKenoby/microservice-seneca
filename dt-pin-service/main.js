require('seneca')()
.use('basic')
.use('entity')
.use('./dt.js')
.use('seneca-repl', {port: 10021})
.listen({type: 'http', pin: 'role:dt'})
