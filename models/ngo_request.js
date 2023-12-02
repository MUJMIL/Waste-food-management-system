const mongoose = require("mongoose");

const ngorequestSchema = new mongoose.Schema({
	message: {
		type: String,
		required: true
	},
    firstName: {
		type: String,		
	},
    lastName: {
		type: String,		
	},
    email: {
		type: String,		
	},
	added_date: {
		type: Date,default: Date.now
		
	}
	

	
	},

{
	timestamp: true,
});

const NgoRequest = mongoose.model("ngorequests", ngorequestSchema);
module.exports = NgoRequest;