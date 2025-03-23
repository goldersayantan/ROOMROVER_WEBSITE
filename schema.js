const joi = require('joi');

const listingSchema = joi.object({
    listing : joi.object({
        title : joi.string().required(),
        image : joi.string().allow("", null),
        description : joi.string().required(),
        location : joi.string().required(),
        country : joi.string().required(),
        price : joi.string().required().min(0)
    }).required(),
})

module.exports = listingSchema;
