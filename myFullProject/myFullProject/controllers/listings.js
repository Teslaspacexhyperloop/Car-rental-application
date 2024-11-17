const Listing=require("../models/listing");

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.searchListing=async(req,res)=>{
    try{
    let {name}=req.query;
    console.log(name);
    // const allListings=await Listing.find({title:name});
    const allListings = await Listing.find({ $text: { $search:name}});

    if(allListings.length>0){
        console.log(allListings);
        res.render("listings/index.ejs",{allListings});
        console.log("allListing");  
    }
    else{
        req.flash("error","No Car of This name");
        
        res.redirect("/listings");
    }
   
    }
    catch{
        req.flash("error","No Car of This name");
        res.redirect("/listings");
    }
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing .findById(id).populate("owner");
    if(!listing){
        req.flash("error","Car you requested for does not exist!"); 
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req, res, next) => {
    try {
        // Extract the listing data from the request body
        let listingData = req.body.listing;

        // Map uploaded files to an array of image objects
        const images = req.files.map(file => ({
            url: file.path,
            filename: file.filename,
        }));

        // Create a new listing with the provided data
        const newListing = new Listing({
            ...listingData,
            images: images, // Assign the array of images
            owner: req.user._id, // Set the current user as the owner
        });

        // Save the listing to the database
        await newListing.save();

        // Send a success flash message
        req.flash("success", "New Car Listing Created");

        // Redirect to the listings page
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Failed to create a new listing. Please try again.");
        res.redirect("/listings");
    }
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing .findById(id);
    if(!listing){
        req.flash("error","Car you requested for does not exist!"); 
        res.redirect("/listings");
    }

    // let originalImageUrl=listing.image.url;
    // originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing});

}

module.exports.updateListing=async(req,res)=>{
    
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    

    if(typeof req.files !== "undefined"){
        const images = req.files.map(file => ({
            url: file.path,
            filename: file.filename,
        }));
        listing.images=images;
        // let url=req.file.path;
        // let filename=req.file.filename;
        // listing.image={url,filename}
        await listing.save();
    }
    
    req.flash("success","Car Listing updated");
    res.redirect(/listings/${id});
}

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let dlist=await Listing.findByIdAndDelete(id);
    console.log(dlist);
    req.flash("success","Car Listing Deleted");
    res.redirect("/listings");
}