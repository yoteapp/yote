const Product = require('./ProductModel')
const YoteError = require('../../global/helpers/YoteError');
const apiUtils = require('../../global/api/apiUtils')

// TODO: in theory, we could split "controller" into single/many/utils files
// any utility functions (internal facing only)

// single api functions
exports.getSingleById = async (req, res) => {
  const product = await Product.findById(req.params.id).catch(err => {
    console.log(err);
    throw new YoteError("Error finding Product", 404)
  });
  if(!product) throw new YoteError("Could not find a matching Product", 404);
  res.json(product);
}

exports.createSingle = async (req, res) => {
  const newProduct = new Product({...req.body, _createdBy: req.user._id})
  const product = await newProduct.save().catch(err => {
    console.log(err)
    throw new YoteError("Error creating Product", 404)
  });
  res.json(product)
}

exports.updateSingleById = async (req, res) => {
  // check the body for an _id, make sure it matches the url param id
  if(req.body?._id && req.body._id !== req.params.id) {
    throw new YoteError("Mismatched Product Ids", 403)
  }
  const oldProduct = await Product.findById(req.params.id).catch(err => {
    console.log(err)
    throw new YoteError("Error finding Product", 404)
  });
  if(!oldProduct) throw new YoteError("Could not find matching Product", 404);
  // apply updates
  Object.assign(oldProduct, req.body)
  const product = await oldProduct.save().catch(err => {
    console.log(err)
    throw new YoteError("Could not update Product", 404)
  });
  res.json(product);

  /**
   * NOTES
   * 
   * mongoose provides a "findByIdAndUpdate" function to shorthand this, however 
   * these limit us a little bit for the more complicated cases, AND they bypass 
   * some of the additional built in model validation stuff so not planning to use
   * 
   * normally we'd want to use the spread operator, but it appears that internally this 
   * calls .toObject() on the mongo object, removing our .save() methods
   * oldProduct = {
   *  ...oldProduct
   *  , ...req.body
   * }
   */
}

exports.deleteSingle = async (req, res) => {
  const oldProduct = await Product.findById(req.params.id).catch(err => {
    console.log(err)
    throw new YoteError("Error finding Product", 404)
  });;
  if(!oldProduct) throw new YoteError("Could not find matching Product", 404);
  const deletedProduct = await oldProduct.remove().catch(err => {
    console.log(err)
    throw new YoteError("There was a problem deleting this Product", 404)
  });
  // console.log('product deleted', deletedProduct);
  // return the deleted product ??
  res.json(deletedProduct);
  /**
   * NOTES
   * 
   * similarly to update, mongoose does provide a single step "findByIdAndRemove",
   * however not planning to use for same reasons as above
   */
}

exports.getDefault = async (req, res) => {
  const defaultProduct = await Product.getDefault();
  if(!defaultProduct) throw new YoteError("Error finding default Product", 404);
  res.json(defaultProduct);
}

// list api functions
exports.getListWithArgs = async (req, res) => {
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const { products, totalPages, totalCount } = await utilFetchProductList({ query, pagination, sort, limit });
  res.json({ products, totalPages, totalCount });
}

const utilFetchProductList = async ({ query, pagination, sort, limit, populate = ''}) => {
  // get count so we can determine total pages for front end to allow proper pagination
  const totalCount = pagination ? await Product.countDocuments(query) : null
  const totalPages = totalCount && Math.ceil(totalCount / pagination.per)
  const products = await Product.find(query)
    .skip(pagination ? (pagination.page - 1) * pagination.per : null)
    .limit(pagination ? pagination.per : (limit || 500))
    .sort(sort)
    .populate(populate)
    .catch(err => {
      console.log(err);
      throw new YoteError("There was a problem finding Product list", 404);
    });
  return { products, totalPages, totalCount };
}

// other experimental/future todos
exports.getSingleByArgs = async (req, res) => { }
exports.bulkUpdate = async (req, res) => { }

// custom api functions
exports.createProductWithRequiredParam = async (req, res) => {
  const { requiredParam } = req.params;
  console.log('creating product with required param: ', requiredParam)
  if (!requiredParam) throw new YoteError("Missing requiredParam", 404);
  if (requiredParam !== 'super-fancy') throw new YoteError("Invalid requiredParam", 404);
  const newProduct = new Product({ ...req.body, _createdBy: req.user._id })
  const product = await newProduct.save().catch(err => {
    console.log(err)
    throw new YoteError("Error creating Product", 404)
  });
  res.json(product)
} 

exports.getLoggedInList = async (req, res) => {
  console.log('getting logged in list');
  const { query, pagination, sort, limit } = await apiUtils.buildMongoQueryFromUrlQuery(req.query);
  const combinedQuery = {
    $and: [
      query
      , { _createdBy: req.user._id }
    ]
  }
  const { products, totalPages, totalCount } = await utilFetchProductList({ query: combinedQuery, pagination, sort, limit });
  res.json({ products, totalPages, totalCount });
}


exports.updateMyProductById = async (req, res) => {
  console.log('updating my product by id');
  let oldProduct = await Product.findOne({_id: req.params.id, _createdBy: req.user._id}).catch(err => {
    console.log(err)
    throw new YoteError("Error finding Product", 404)
  });
  if(!oldProduct) throw new YoteError("Could not find matching Product", 404);
  oldProduct = Object.assign(oldProduct, req.body)
  const product = await oldProduct.save().catch(err => {
    console.log(err)
    throw new YoteError("Could not update Product", 404)
  });
  res.json(product)
}