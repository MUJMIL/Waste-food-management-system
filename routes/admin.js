const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");
const NgoRequest = require("../models/ngo_request.js");
const Approval = require("../models/approval.js");




router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numAdmins = await User.countDocuments({ role: "admin" });
	const numDonors = await User.countDocuments({ role: "donor" });
	const numAgents = await User.countDocuments({ role: "agent" });
	const numNgos = await User.countDocuments({ role: "ngo" });

	const numPendingDonations = await Donation.countDocuments({ status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ status: "collected" });
	const numNgoAssigned = await Donation.countDocuments({ ngo_status: "collected" });
	const numNgoNotAssigned = await Donation.countDocuments({ ngo_status: "collected" });

	res.render("admin/dashboard", {
		title: "Dashboard",numNgoAssigned,numNgoNotAssigned,
		numAdmins, numDonors, numAgents,numNgos, numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations
	});
});

router.get("/admin/ngo_request", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const ngoRequest = await NgoRequest.find().sort({added_date:-1});
		res.render("admin/view_ngorequest", { title: "NGO Request", ngoRequest });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donations/pending", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({status: ["pending", "accepted", "assigned"]}).populate("donor");
		res.render("admin/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donations/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ status: "collected" }).populate("donor");
		res.render("admin/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("donor").populate("agent").populate("ngo");
		res.render("admin/donation", { title: "Donation details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/accept/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "accepted" });
		req.flash("success", "Donation accepted successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/reject/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "rejected" });
		req.flash("success", "Donation rejected successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const agents = await User.find({ role: "agent" });
		const ngos = await User.find({ role: "ngo" });

		const donation = await Donation.findById(donationId).populate("donor");
		res.render("admin/assignAgent", { title: "Assign agent & NGO", donation, agents,ngos});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const {agent, adminToAgentMsg,	adminToNgoMsg,ngo} = req.body;
		await Donation.findByIdAndUpdate(donationId, { status: "assigned",ngo_status:"assigned", agent, adminToAgentMsg,adminToNgoMsg ,ngo});
		req.flash("success", "Agent and NGO assigned successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/agents", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const agents = await User.find({ role: "agent" });
		res.render("admin/agents", { title: "List of agents", agents });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/ngos", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const ngos = await User.find({ role: "ngo" });
		res.render("admin/ngos", { title: "List of ngos", ngos });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/approveNewRegister", middleware.ensureAdminLoggedIn, async(req,res) => {
	const data= await Approval.find({approve:0});
	res.render("admin/approveNewRegisters", { title: "Approve New Registrations",data });
});


router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("donor").populate("agent").populate("ngo");
		res.render("admin/donation", { title: "Donation details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/newApproval_accept/:unAppId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const unAppId = req.params.unAppId;
		await Approval.findByIdAndUpdate(unAppId, { approve: 1 });
		const dd=await Approval.find({_id:unAppId})


		// hero['name']
		// var newUser=0;

		// if(dd.length){ 
		
		// 		 newUser = new User(dd);
		// 		 await newUser.save();

			
		// }

		// const newUser = new User({ ddfirstName, dd.lastName, dd.email, dd.password, role });
		// const salt = bcrypt.genSaltSync(10);
		// const hash = bcrypt.hashSync(newUser.password, salt);
		// newUser.password = hash;
		// await newUser.save();
	
		req.flash("success", "Approved");
		res.redirect(`/admin/dashboard`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/newApproval_reject/:unAppId/:emailid", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const unAppId = req.params.unAppId;
		const emailid = req.params.emailid;

		// await Approval.findByIdAndUpdate(unAppId, { approve: 1 });
		// const dd=await Approval.find({_id:unAppId})

		User.findOneAndDelete(({ email:emailid}), function (err, docs) {
			if (err){
				console.log(err)
			}
			else{
				console.log( docs);
			}
		 });

		 Approval.findOneAndDelete(({ email:emailid}), function (err, docs) {
			if (err){
				console.log(err)
			}
			else{
				console.log( docs);
			}
		 });

	
		req.flash("rejected");
		res.redirect(`/admin/dashboard`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});


module.exports = router;