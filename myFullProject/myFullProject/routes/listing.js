const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
// const upload=multer({dest:"uploads/"})//uploads name ka folder apne aap ban jayega aur image usi me save ho jayegi
const upload=multer({storage});//cloud par store hoga


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.array("listing[images]", 10), // Allow up to 10 images
        validateListing,
        wrapAsync(listingController.createListing)
    );


router.get("/search",isLoggedIn,listingController.searchListing)
//new route
//is new route ko listing/:id se upar hi likhna padega
//warna error ayega qki "new" ko ye id samajhega
router.get("/new",isLoggedIn,listingController.renderNewForm)


router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn,
        isOwner,
        upload.array("listing[image]",10),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports=router;