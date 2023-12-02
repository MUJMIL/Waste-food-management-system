const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");
const NgoRequest = require("../models/ngo_request.js");


router.get("/ngo/dashboard", middleware.ensureNgoLoggedIn, async (req,res) => {
	const ngoId = req.user._id;
	const numNotReceivedNGO = await Donation.countDocuments({ ngo: ngoId, ngo_status: "assigned",status: "assigned" });
	const numReceivedNGO = await Donation.countDocuments({ ngo: ngoId, ngo_status: "assigned",status: "collected" });

	// const numCollectedDonations = await Donation.countDocuments({ ngo: ngoId, status: "collected" });
	res.render("ngo/dashboard", {
		title: "Dashboard",
		numNotReceivedNGO, numReceivedNGO
	});
});

router.get("/ngo/collections/pending", middleware.ensureNgoLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({ ngo: req.user._id, ngo_status: "assigned",status: "assigned" }).populate("donor");
		res.render("ngo/pendingCollections", { title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/ngo/collections/previous", middleware.ensureNgoLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ ngo: req.user._id, status: "collected",ngo_status: "assigned" }).populate("donor");
		res.render("ngo/previousCollections", { title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/ngo/collection/view/:collectionId", middleware.ensureNgoLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await Donation.findById(collectionId).populate("donor");
		res.render("ngo/collection", { title: "Collection details", collection });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

// router.get("/ngo/collection/collect/:collectionId", middleware.ensureNgoLoggedIn, async (req,res) => {
// 	try
// 	{
// 		const collectionId = req.params.collectionId;
// 		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
// 		req.flash("success", "Donation collected successfully");
// 		res.redirect(`/ngo/collection/view/${collectionId}`);
// 	}
// 	catch(err)
// 	{
// 		console.log(err);
// 		req.flash("error", "Some error occurred on the server.")
// 		res.redirect("back");
// 	}
// });



router.get("/ngo/profile", middleware.ensureNgoLoggedIn, (req,res) => {
	res.render("ngo/profile", { title: "My Profile" });
});

router.put("/ngo/profile", middleware.ensureNgoLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.ngo;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/ngo/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});
router.get("/ngo/donation_request", middleware.ensureNgoLoggedIn, (req,res) => {
	res.render("ngo/donation_request", { title: "Donation Request" });
});

router.post("/ngo/save_donation_request", middleware.ensureNgoLoggedIn, async (req,res) => {

	console.log(req.user.firstName)
	const fn=req.user.firstName;
	const ln=req.user.lastName;
	const em=req.user.email;


	const { message, added_date} = req.body;
	try
	{		
		const newNgoRequest = new NgoRequest({ message:message, added_date:added_date,firstName:fn,lastName:ln,email:em});
		console.log(newNgoRequest)
 			await newNgoRequest.save();

		req.flash("success", "New Request sent successfully !! .");
		res.redirect(`/ngo/donation_request`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}


	
});


module.exports = router;