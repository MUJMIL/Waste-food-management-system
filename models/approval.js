const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema({
	firstName: {
		type: String,
		
	},
	lastName: {
		type: String,
	
	},
	email: {
		type: String,
	
	},
	password: {
		type: String,
		
	},

	
	joinedTime: {
		type: Date,
		default: Date.now
	},
	role: {
		type: String,
		enum: ["admin", "donor", "agent","ngo"],
	
	},
    approve:{
        type:Number
    }
});

const Approval = mongoose.model("approvals", approvalSchema);
module.exports = Approval;