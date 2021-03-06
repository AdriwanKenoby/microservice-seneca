var fulltextsearchlight = require('full-text-search-light')
var search = new fulltextsearchlight()
// Add filter, this function will be called on every single field
// If you don't want to add a field to the search just return false
var filter = function (key, val) {
	// Return false if you want to ignore field
	if (key == 'work') {
		return true
	}
	return false
}

var assoc_id = {}

module.exports = function engine(options) {

	this.add('role:engine,info:dt,cmd:index', (msg, respond) => {
		assoc_id[msg.dt.id] = search.add({id: msg.dt.id, work: msg.dt.work}, filter);
		// Save current db
		search.save('search.json', (err) => {
			if (err) return respond({ success: false, msg: err })
			respond(null, {success:true})
		})
	})

	this.add('role:engine,info:dt,cmd:search', (msg, respond) => {
		// Load db
		fulltextsearchlight.load('search.json', function(err, search_loaded){
			if (err) return respond({ success: false, msg: err })
			let results = search_loaded.search(msg.q);
			respond(null, {success: true, data: results})
		})
	})

	this.add('role:engine,info:dt,cmd:update', (msg, respond) => {
		search.remove(assoc_id[msg.dt.id])
		delete assoc_id[msg.dt.id]
		assoc_id[msg.dt.id] = search.add({id: msg.dt.id, work: msg.dt.work}, filter);
		// Save current db
		search.save('search.json', (err) => {
			if (err) return respond({ success: false, msg: err })
			respond(null, {success:true})
		})
	})

	this.add('role:engine,info:dt,cmd:delete', (msg, respond) => {
		search.remove(assoc_id[msg.dt.id])
		delete assoc_id[msg.dt.id]
		search.save('search.json', (err) => {
			if (err) return respond({ success: false, msg: err })
			respond(null, {success:true})
		})
	})
}
