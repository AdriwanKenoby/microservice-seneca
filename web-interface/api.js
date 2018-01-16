module.exports = function api(options) {

	// traitement des messages Seneca de type { role , path }
	this.add('role:api,path:dt', (msg, respond) => {
		this.act('role:dt', {
			cmd:    msg.request$.method,  // envoi de la méthode HTTP associée à la requête
			id:     msg.args.params.id_dt,	// envoi de l'identifiant de la DT transmis dans la requête HTTP
			data:   msg.args.body
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
					}
				}
			}
		}, respond)
	})
}
