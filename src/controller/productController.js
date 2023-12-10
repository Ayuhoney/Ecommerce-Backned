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

const validSortFields = ["title", "price", "createdAt"];
const validOrderOptions = ["asc", "desc"];

const parseQueryParams = (query) => {
    let { page = 1, limit = 5, search = "", sort = "price", order = "asc", category = "All" } = query;

    page = parseInt(page) - 1;
    limit = parseInt(limit);

    sort = validSortFields.includes(sort) ? sort : "price";
    order = validOrderOptions.includes(order) ? order : "asc";

    let categoryFilter = {};
    if (category !== "All") {
        const categories = category.split(",");
        categoryFilter = { category: { $in: categories } };
    }

    return { page, limit, search, sort, order, categoryFilter };
};

const buildSearchQuery = (search) => {
    if (search) {
        return { title: { $regex: search, $options: "i" } };
    }
    return {};
};

const pagination = async (req, res) => {
    try {
        const { page, limit, search, sort, order, categoryFilter } = parseQueryParams(req.query);
        const regexSearch = buildSearchQuery(search);

        const products = await Product.find({ ...regexSearch, ...categoryFilter })
            .sort({ [sort]: order })
            .skip(page * limit)
            .limit(limit);

        const total = await products.countDocuments({ ...regexSearch, ...categoryFilter });

        const response = {
            error: false,
            total,
            page: page + 1,
            limit,
            categories: categoriesOptions,
            products,
        };

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};
module.exports = {
  createProduct,
  getLimitedProducts,
  getPopularProducts,
  getAllproducts,
  searchProduct,
  pagination
};