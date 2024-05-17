let express = require("express")
let app = express();
const mongoose = require("mongoose");
const list = require("./Models/listing.js");
let path = require("path");
const methodOverride = require("method-override")
engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}= require("./SchemaValidation.js");
const Review = require("./Models/review.js");






app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended : true}))
app.use(methodOverride("_method"));
app.engine('ejs', engine);


main()
.then((res)=>{
    console.log(res)
})
.catch((err) =>{
    console.log(err)
    });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/project');

}

let validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,result.error)
    }
    else{
        next()
    }
}
let validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,result.error)
    }
    else{
        next()
    }
}

app.get("/",(req,res)=>{
    res.send("cbse result will be declared on 7-5-2024 at 5 O'clock")
})

// app.get("/listing",async (req,res)=>{
//     let sample = new list({
//         title : "Taj Hotel",
//         description : "Best hotel of the world",
//         price : 12000,
//         location : "Mumbai",
//         country : "India",
//     })
//     await sample.save();
//     console.log("sample saved");
//     res.send("successful testing");

// })


app.get("/listing",wrapAsync (async (req,res)=>{
     let allList = await list.find()
    res.render("./listings/index.ejs",{allList})

}))

app.get("/listing/new",(req,res)=>{

    res.render("./listings/new.ejs")
 
 })


app.get("/listing/:id",wrapAsync (async (req,res)=>{
    let {id} = req.params;
    const Listings = await list.findById(id).populate("reviews");
    console.log(Listings)
    res.render("listings/show.ejs",{Listings})

})
)

app.post("/listing" ,validateListing,wrapAsync(
    async (req,res,next)=>{
    
        let newlisting = new list(req.body.listing)
    await newlisting.save()
    .then((res)=>{
        console.log(res)
    })
   res.redirect("/listing")
    

}
))

app.get("/listing/:id/edit",wrapAsync (async (req,res)=>{
    let {id} = req.params;
    let Listings = await list.findById(id)
    res.render("./listings/edit.ejs",{Listings})
}))

app.put("/listing/:id",validateListing,wrapAsync (async (req,res)=>{
    let {id} = req.params;
    await list.findByIdAndUpdate(id, { ...req.body.listing})
    res.redirect(`/listing/${id}`)
}))

app.delete("/listing/:id",wrapAsync (async(req,res)=>{
    let {id} = req.params;
    await list.findByIdAndDelete(id)
    res.redirect("/listing")
}))

// save new review 
app.post("/listing/:id/review",validateReview,wrapAsync(
    async(req,res)=>{
        const listings = await list.findById(req.params.id)
        let newReview = new Review (req.body.review)
    
        listings.reviews.push(newReview)
    
        await listings.save()
        await newReview.save()
    
        console.log("review created")
    
        res.redirect(`/listing/${req.params.id}`)
    
    }
))

// delete review

app.delete("/listing/:id/review/:reviewId",wrapAsync(
    async(req,res)=>{
        let {id , reviewId} = req.params;

        await Review.findByIdAndDelete(reviewId)
        await list.findByIdAndUpdate(id, {$pull:{reviews : reviewId }})

        
    res.redirect(`/listing/${id}`)
    }
))

// listingSchema.post("findOneAndDelete",async(listing)=>{
//         if(listing){
//             await Review.deleteMany({_id:{$in: listing.reviews}})
//         }
//     }
// )


app.use((err,req,res,next)=>{
    let {status= 404, message= "page not found"} = err;
    res.status(status).render("error.ejs", {message})
})

app.listen(8080,(req,res)=>{
    console.log("listening")
})