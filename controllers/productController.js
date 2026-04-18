const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      category: req.query.category,
      inStock: req.query.inStock,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    };
    
    const result = await productService.getAllProducts(options);
    
    res.render('products/index', {
      title: 'Liste des produits',
      products: result.products,
      pagination: result.pagination,
      filters: options
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).render('error', {
      title: 'Erreur',
      message: error.message || 'Une erreur est survenue'
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.render('products/details', {
      title: product.name,
      product
    });
  } catch (error) {
    if (error.message === 'Produit non trouvé' || error.message === 'ID de produit invalide') {
      return res.status(404).render('error', {
        title: 'Produit non trouvé',
        message: error.message
      });
    }
    
    res.status(500).render('error', {
      title: 'Erreur',
      message: 'Une erreur est survenue'
    });
  }
};

exports.showCreateForm = (req, res) => {
  res.render('products/create', {
    title: 'Ajouter un produit',
    categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
    product: {}
  });
};

exports.createProduct = async (req, res) => {
  try {
    console.log('Données reçues:', req.body); // Debug
    
    // Traitement des tags
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    // Préparation des données
    const productData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity) || 0,
      category: req.body.category,
      description: req.body.description || '',
      tags: tags,
      inStock: req.body.inStock === 'on' || req.body.inStock === 'true'
    };
    
    const product = await productService.createProduct(productData);
    res.redirect(`/products/${product._id}`);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(400).render('products/create', {
      title: 'Ajouter un produit',
      categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
      product: req.body,
      error: error.message
    });
  }
};

exports.showEditForm = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    
    res.render('products/edit', {
      title: `Modifier ${product.name}`,
      categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
      product
    });
  } catch (error) {
    if (error.message === 'Produit non trouvé' || error.message === 'ID de produit invalide') {
      return res.status(404).render('error', {
        title: 'Produit non trouvé',
        message: error.message
      });
    }
    
    res.status(500).render('error', {
      title: 'Erreur',
      message: 'Une erreur est survenue'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags.split(',').map(tag => tag.trim());
    }
    
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity) || 0,
      category: req.body.category,
      description: req.body.description || '',
      tags: tags,
      inStock: req.body.inStock === 'on' || req.body.inStock === 'true'
    };
    
    const product = await productService.updateProduct(req.params.id, updateData);
    res.redirect(`/products/${product._id}`);
  } catch (error) {
    console.error('Erreur:', error);
    
    if (error.message === 'Produit non trouvé' || error.message === 'ID de produit invalide') {
      return res.status(404).render('error', {
        title: 'Produit non trouvé',
        message: error.message
      });
    }
    
    res.status(400).render('products/edit', {
      title: 'Modifier le produit',
      categories: ['Électronique', 'Vêtements', 'Alimentation', 'Livres', 'Autres'],
      product: { ...req.body, _id: req.params.id },
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    req.session.flashMessage = { type: 'success', text: 'Produit supprimé avec succès' };
    res.redirect('/products');
  } catch (error) {
    console.error('Erreur:', error);
    req.session.flashMessage = { type: 'error', text: error.message };
    res.redirect('/products');
  }
};