const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");





const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;

const stripe = require('stripe')('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')

const YOUR_DOMAIN = 'http://localhost:5000';


router.post('/donor/create-checkout-session',middleware.ensureDonorLoggedIn, async (req, res) => {
        //  console.log(req.user._id)

		// console.log(req.body)

	const agents = await User.find({ firstName: "nil"});
	//  console.log(agents[0]._id)


	

		const PRICE_ID=req.body.price_id;

		try
		{
			console.log("cc="+req.body.donation);
			const donation = req.body.donation;
			
				donation.status = "collected";
				donation.ngo_status = "notassigned";
				donation.agent = agents[0]._id;

				donation.address = "nil";

				donation.donateTime = Date.now();
				donation.collectionTime = Date.now();
if(PRICE_ID=='price_1NI2mtSIGvrmGhPSa4AlvutC')
{
	donation.quantity="Rs 6";
}

if(PRICE_ID=='price_1NHQe8SIGvrmGhPSNykrfhEU')
{
	console.log("quantity")
	donation.quantity="Rs 1";
}

if(PRICE_ID=='price_1NHQfsSIGvrmGhPSGuK7t5tf')
{

	donation.quantity="Rs 100";
}

if(PRICE_ID=='price_1NHQgPSIGvrmGhPSKjc40dqg')
{
	donation.quantity="Rs 500";
}


				donation.donationType="Funds";
			

		
		
			donation.donor = req.user._id;
			const newDonation = new Donation(donation);
			await newDonation.save();
			req.flash("success", "Fund donated Successfully");
		
		}
		catch(err)
		{
			console.log(err);
			req.flash("error", "Some error occurred on the server.")
		
		}

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/donor/dashboard`,
	

    cancel_url: `${YOUR_DOMAIN}/404page`,
  });

  res.redirect(303, session.url);
});

router.post("/donor/donate", middleware.ensureDonorLoggedIn, async (req,res) => {


	try
	{
		console.log("cc="+req.body.donation);
		const donation = req.body.donation;
		if(donation.agent!=""){
			donation.status = "assigned";
		}else{
			donation.status = "pending";
		}
		if(donation.ngo!="0"){
			donation.ngo_status = "assigned";
		}else{
			donation.ngo_status = "notassigned";
		}
		donation.donor = req.user._id;

		if(donation.agent=="" && donation.ngo=="0"){
		console.log('          11              ')
			const	 newDonation = new Donation({donor:req.user._id,quantity:donation.quantity,donationType:donation.donationType,
			donateTime:donation.donateTime,address:donation.address,phone:donation.phone,donorToAdminMsg:donation.donorToAdminMsg,status:donation.status,ngo_status:donation.ngo_status});
			await newDonation.save();
		}
		if(donation.agent!="" && donation.ngo=="0"){
		console.log('          22             ')
			
			const	 newDonation = new Donation({donor:req.user._id,quantity:donation.quantity,donationType:donation.donationType,agent:donation.agent,
			donateTime:donation.donateTime,address:donation.address,phone:donation.phone,donorToAdminMsg:donation.donorToAdminMsg,status:donation.status,ngo_status:donation.ngo_status});
			await newDonation.save();
		}
		if(donation.agent=="" && donation.ngo!="0"){
		console.log('          33             ')
			
			const	 newDonation = new Donation({donor:req.user._id,quantity:donation.quantity,donationType:donation.donationType,ngo:donation.ngo,
			donateTime:donation.donateTime,address:donation.address,phone:donation.phone,donorToAdminMsg:donation.donorToAdminMsg,status:donation.status,ngo_status:donation.ngo_status});
			await newDonation.save();
		}
		if(donation.agent!="" && donation.ngo!="0"){
		console.log('          44              ')

			const newDonation = new Donation(donation);
			await newDonation.save();
		}
		
		
		
		
		req.flash("success", "Donation request sent successfully");
		res.redirect("/donor/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/dashboard", middleware.ensureDonorLoggedIn, async (req,res) => {
	const donorId = req.user._id;
	const numPendingDonations = await Donation.countDocuments({ donor: donorId, status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ donor: donorId, status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ donor: donorId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ donor: donorId, status: "collected" });
	res.render("donor/dashboard", {
		title: "Dashboard",
		numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations
	});
});

router.get("/donor/donate", middleware.ensureDonorLoggedIn, async(req,res) => {
	const agents = await User.find({ role: "agent"}).populate("lastName");
	const ngos = await User.find({ role: "ngo" }).populate("lastName");
	// res.render("donor/pendingDonations", { title: "Pending Donations", pendingDonations });
	// await User.findByIdAndUpdate(id, updateObj);
	res.render("donor/donate", { title: "Donate",ngos,agents });
});

router.get("/donor/donate_funds", middleware.ensureDonorLoggedIn, async(req,res) => {
// router.get("/donor/donate_funds", async(req,res) => {
	res.render("donor/fund_donate", { title: "Donate Funds" });
});

router.post('/donor/create-customer', middleware.ensureDonorLoggedIn,async(req,res)=>{

    try {

        const customer = await stripe.customers.create({
            name:req.body.donar_name,
            email:req.body.donar_email
			
        });

		res.redirect(`/donor/donate_fund_addcard/view/${customer.id}/${customer.name}/${customer.email}`);

        //res.status(200).send(customer);

    } catch (error) {
        res.status(400).send({success:false,msg:error.message});
    }

});


router.get("/donor/donate_fund_addcard/view/:customerId/:customername/:customerEmail", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const customerId = req.params.customerId;
		const customername = req.params.customername;
		const customerEmail = req.params.customerEmail;

		// const donation = await Donation.findById(donationId).populate("donor").populate("agent").populate("ngo");
		res.render("donor/add_card", { title: "Add Card", customerId,customername,customerEmail });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.post('/donor/addNewCard', middleware.ensureDonorLoggedIn,async(req,res)=>{
	const {
		customer_id,
		card_Name,
		card_ExpYear,
		card_ExpMonth,
		card_Number,
		card_CVC,
	} = req.body;

	const card_token = await stripe.tokens.create({
		card:{
			name: card_Name,
			number: card_Number,
			exp_year: card_ExpYear,
			exp_month: card_ExpMonth,
			cvc: card_CVC
		}
	});

	const params = {
		payment_method_types:  ['card'] ,
		amount: 5999,
		currency: 'INR',
		setup_future_usage: "off_session",
		customer: customer_id,

	  }
	//   payment_method : card_token.card.id,

	  try {
		const paymentIntent = await stripe.paymentIntents.create(params);
	
		// Send publishable key and PaymentIntent details to client
		// res.send({
		//   clientSecret: paymentIntent.client_secret,
		//   nextAction: paymentIntent.next_action,
		// });

		

     

        const card = await stripe.customers.createSource(customer_id, {
            source: `${card_token.id}`
        });

        res.status(200).send(card_token);
	  } catch (e) {
		return res.status(400).send({
		  error: {
			message: e.message,
		  },
		});
	  }
});


router.post('/donor/addNewCardX', middleware.ensureDonorLoggedIn,async(req,res)=>{

    try {

        const {
            customer_id,
            card_Name,
            card_ExpYear,
            card_ExpMonth,
            card_Number,
            card_CVC,
        } = req.body;

        const card_token = await stripe.tokens.create({
            card:{
                name: card_Name,
                number: card_Number,
                exp_year: card_ExpYear,
                exp_month: card_ExpMonth,
                cvc: card_CVC
            }
        });

        const card = await stripe.customers.createSource(customer_id, {
            source: `${card_token.id}`
        });

        // res.status(200).send(card_token.card.id);
		res.redirect(`/donor/create_charges/view/${customer_id}/${card_token.card.id}`);

    } catch (error) {
        res.status(400).send({success:false,msg:error.message});
    }
});

router.get("/donor/create_charges/view/:customerId/:cardId", middleware.ensureDonorLoggedIn, async (req,res) => {

	try
	{
		const customerId = req.params.customerId;
		const cardId = req.params.cardId;

		// const donation = await Donation.findById(donationId).populate("donor").populate("agent").populate("ngo");
		res.render("donor/createCharge", { title: "Pay", customerId,cardId});
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post('/donor/createCharges', middleware.ensureDonorLoggedIn,async(req,res)=>{

    try {

        const {
            customer_id,
            card_Name,
            card_ExpYear,
            card_ExpMonth,
            card_Number,
            card_CVC,
        } = req.body;

        const card_token = await stripe.tokens.create({
            card:{
                name: card_Name,
                number: card_Number,
                exp_year: card_ExpYear,
                exp_month: card_ExpMonth,
                cvc: card_CVC
            }
        });

        const card = await stripe.customers.createSource(customer_id, {
            source: `${card_token.id}`
        });

        // res.status(200).send(card_token.card.id);
		res.redirect(`/donor/create_charges/view/${customer_id}/${card_token.card.id}`);

    } catch (error) {
        res.status(400).send({success:false,msg:error.message});
    }
});


router.get("/donor/donations/pending", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({ donor: req.user._id, status: ["pending", "rejected", "accepted", "assigned"] }).populate("agent");
		res.render("donor/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/donations/previous", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ donor: req.user._id, status: "collected" }).populate("agent");
		res.render("donor/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/donation/deleteRejected/:donationId", async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndDelete(donationId);
		res.redirect("/donor/donations/pending");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/donor/profile", middleware.ensureDonorLoggedIn, (req,res) => {
	res.render("donor/profile", { title: "My Profile" });
});

router.put("/donor/profile", middleware.ensureDonorLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.donor;	// updateObj: {firstName, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/donor/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


module.exports = router;

