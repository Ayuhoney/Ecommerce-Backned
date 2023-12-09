const productModel = require("../model/productModel");
const { productSchema } = require("../validators/schemaValidation");

const createProduct = async function (req, res) {
  try {
   
    let {title,description,price,brand,stock,category } = req.body;

    if (Object.keys(req.body).length == 0 || Object.keys(req.body).length > 6) {
      return res.status(400).send({ status: false, message: "invalid request" });
    }
    const valid = productSchema.validate(req.body);

    if (valid.error) {
      return res.status(400).send(valid.error.details[0].message);
    }
    let product = await productModel.create(req.body);
    return res.status(201).send({status: true,message: "Success",data: product,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const getLimitedProducts = async (req, res) => {
  try {
    let products = await productModel.find().limit(30);
    return res.status(200).send({ status: true, products });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getPopularProducts = async (req, res) => {
  try {
    let products = await productModel.find().limit(5);
    return res.status(200).send({ status: true, products });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getAllproducts = async (req, res) => {
  let id = req.params.id
  try {
    let products = await productModel.find(id)
    return res.status(200).send({ status: true, products });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const searchProduct = async (req, res) => {
  try {
    const { searchQuery } = req.query;
   
    const products = await productModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
      ],
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getLimitedProducts,
  getPopularProducts,
  getAllproducts,
  searchProduct,
};