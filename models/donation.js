const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
	donor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true
	},
	agent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	ngo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	donationType: {
		type: String,
		required: true
	},
	quantity: {
		type: String,
		required: true
	},
	donateTime: {
		type: Date,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true
	},
	adminToNgoMsg: {
		type: String
		
	},
	donorToAdminMsg: String,
	adminToAgentMsg: String,
	
	collectionTime: {
		type: Date,
	},
	status: {
		type: String,
		enum: ["pending", "rejected", "accepted", "assigned", "collected"],
		required: true
	},
	ngo_status: {
		type: String,
		enum: [ "assigned", "notassigned"],
		required: true
	},
},
{
	timestamp: true,
});

const Donation = mongoose.model("donations", donationSchema);
module.exports = Donation;