const Joi = require('joi')

const authSchema = Joi.object().keys({
mobile:Joi.string().min(10).max(10).required(), 
name: Joi.string().min(3).max(32).required(),
email:Joi.string().email().lowercase().required().regex(/^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/),
password:Joi.string().min(2).required(),

})
const productSchema = Joi.object({
  title:Joi.string().required(),
  description:Joi.string().required(),
  brand:Joi.string().required(),
  category:Joi.string().required(),
  price:Joi.number().required(),
  stock:Joi.number().required(),

  
  })
  const orderSchema = Joi.object({
   name:Joi.string().required().min(3),
   phone:Joi.string().required().regex(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/),
   house:Joi.string().required().min(3).max(25),
   city:Joi.string().required().min(5).max(20),
   state:Joi.string().required().min(3).max(30),
   pincode:Joi.number().required().min(111111).max(999999)
    
    
  })


module.exports = {authSchema,productSchema,orderSchema}