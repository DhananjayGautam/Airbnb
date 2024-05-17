 const Joi = require('joi');

 module.exports.listingSchema  = Joi.object({
    listing: Joi.required({
        Title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    country: Joi.string().required() 
    })     
}).required()

module.exports.reviewSchema = Joi.object({
    review: Joi.required({
        range : Joi.number().required().min(1).max(5),
    comment : Joi.string().required()
    })
}).required()