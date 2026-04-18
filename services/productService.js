const Product = require('../models/product');

exports.createProduct = async (productData) => {
  try {
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      throw new Error(`Erreur de validation: ${messages.join(', ')}`);
    }
    throw error;
  }
};

exports.getAllProducts = async (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filter = {};
  
  if (options.category) {
    filter.category = options.category;
  }
  
  if (options.inStock === 'true') {
    filter.inStock = true;
  }
  
  if (options.minPrice || options.maxPrice) {
    filter.price = {};
    if (options.minPrice) filter.price.$gte = parseFloat(options.minPrice);
    if (options.maxPrice) filter.price.$lte = parseFloat(options.maxPrice);
  }
  
  if (options.search) {
    filter.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { description: { $regex: options.search, $options: 'i' } }
    ];
  }
  
  const sort = {};
  if (options.sortBy) {
    sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }
  
  try {
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return {
      products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    };
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
  }
};

exports.getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Produit non trouvé');
    }
    return product;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('ID de produit invalide');
    }
    throw error;
  }
};

exports.updateProduct = async (id, updateData) => {
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!product) {
      throw new Error('Produit non trouvé');
    }
    
    return product;
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      throw new Error(`Erreur de validation: ${messages.join(', ')}`);
    }
    if (error.name === 'CastError') {
      throw new Error('ID de produit invalide');
    }
    throw error;
  }
};

exports.deleteProduct = async (id) => {
  try {
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      throw new Error('Produit non trouvé');
    }
    
    return { message: 'Produit supprimé avec succès', product };
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('ID de produit invalide');
    }
    throw error;
  }
};

exports.createProduct = async (productData) => {
  try {
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      throw new Error(`Erreur de validation: ${messages.join(', ')}`);
    }
    throw error;
  }
};