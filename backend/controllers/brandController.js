// controllers/brandController.js
const  Brand  = require("../models/Brand");
const slugify = require("slugify");
const Product = require("../models/Product");

exports.createBrand = async (req, res) => {
  try {
    let data = req.body;
    const sellerId = req.user.id; 

    // Case 1: Single object
    if (!Array.isArray(data)) {
      if (!data.name) {
        return res.status(400).json({ error: "Brand name is required" });
      }

      const brand = await Brand.create({
        name: data.name,
        slug: slugify(data.name, { lower: true }),
        logo: data.logo,
        description: data.description,
        isFeatured: data.isFeatured || false,
        sellerId: sellerId
      });

      return res.status(201).json(brand);
    }

    // Case 2: Array of objects (bulk insert)
    const invalidBrands = data.filter((item) => !item.name);
    if (invalidBrands.length > 0) {
      return res.status(400).json({ error: "All brands must have a name" });
    }

    const brandsToCreate = data.map((item) => ({
      name: item.name,
      slug: slugify(item.name, { lower: true }),
      logo: item.logo,
      description: item.description,
      isFeatured: item.isFeatured || false,
      sellerId: sellerId
    }));

    const brands = await Brand.bulkCreate(brandsToCreate);
    return res.status(201).json(brands);

  } catch (err) {
    console.error("Error creating brand:", err);
    return res.status(500).json({ error: err.message });
  }
};


// Get All Brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [["name", "ASC"]] });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;

    if (!brandId) {
      return res.status(400).json({ error: "Brand ID is required" });
    }

    const products = await Product.findAll({ 
      where: { brandId: brandId } 
    });

    if (products.length === 0) {
      return res.status(404).json({ error: "No products found for this brand" });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update Brand
exports.updateBrand = async (req, res) => {
  try {
    const { name, logo, description, isFeatured } = req.body;

    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    await brand.update({
      name,
      slug: slugify(name, { lower: true }),
      logo,
      description,
      isFeatured
    });

    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });

    await brand.destroy();
    res.json({ message: "Brand deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrandBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({ error: "Seller Id is required" });
    }

    const brands = await Brand.findAll({
      where: { sellerId: sellerId }
    });

    if (!brands || brands.length === 0) {
      return res.status(404).json({ error: "No brands found for this Seller Id" });
    }

    return res.json(brands);

  } catch (err) {
    console.error("Error fetching brands:", err);
    return res.status(500).json({ error: "Failed to find brands" });
  }
};
