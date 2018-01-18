module.exports = function api(options) {

	// traitement des messages Seneca de type { role , path }
	this.add('role:api,path:dt', (msg, respond) => {
		let data = msg.args.body;     // accès aux données présentes dans la requête HTTP
		let params = msg.args.params; // accès aux données passées via l’URL
		this.act('role:dt', {
			cmd: msg.request$.method, // HTTP method
			id: params.id_dt,
			data: {
				applicant: data.applicant,
				work: data.work,
				state: data.state
			}
		}, respond)
	})

	this.add('role:api,path:stats', (msg, respond) => {
		this.act('role:stats', {
			applicant: 		msg.args.params.user
		}, respond)
	})

	this.add('role:api,path:engine', (msg, respond) => {
		this.act('role:engine,info:dt,cmd:search', {
			q: msg.args.params.query
		}, respond)
	})

	// action déclenchée au démarrage de l’application permettant la transformation
	// des requêtes HTTP en messages Seneca
	this.add('init:api', (msg, respond) => {
		this.act('role:web', {
			routes: {
				prefix: '/api',
				// traite le premier préfixe '/api'
				pin: 'role:api,path:*',
				map: {
					dt: {
						// méthodes HTTP autorisées
						GET: true,
						PUT: true,
						DELETE: true,
						POST: true,
						suffix: '/:id_dt?'
					},
					stats: {
						GET: true,
						suffix: '/:user?'
					},
					engine: {
						GET: true,
						suffix: '/:query'
					}
				}
			}
		}, respond)
	})
}
