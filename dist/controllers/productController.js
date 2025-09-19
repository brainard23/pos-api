"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.createProduct = exports.getProducts = void 0;
const express_validator_1 = require("express-validator");
const Product_1 = __importDefault(require("../models/Product"));
const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        const search = req.query.search || '';
        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        const total = await Product_1.default.countDocuments(query);
        const productsQuery = Product_1.default.find(query).sort({ name: 1 }).skip((page - 1) * limit);
        if (limit > 0) {
            productsQuery.limit(limit);
        }
        const products = await productsQuery;
        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { name, description, sku, barcode, category, price, cost, stock, minStock, supplier, unit, } = req.body;
        const existingProduct = await Product_1.default.findOne({ sku });
        if (existingProduct) {
            res.status(400).json({ message: 'Product with this SKU already exists' });
            return;
        }
        if (barcode) {
            const existingBarcode = await Product_1.default.findOne({ barcode });
            if (existingBarcode) {
                res.status(400).json({ message: 'Product with this barcode already exists' });
                return;
            }
        }
        const product = new Product_1.default({
            name,
            description,
            sku,
            barcode,
            category,
            price,
            cost,
            stock,
            minStock,
            supplier,
            unit,
        });
        await product.save();
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.createProduct = createProduct;
const getProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.getProduct = getProduct;
const updateProduct = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        if (req.body.sku && req.body.sku !== product.sku) {
            const existingProduct = await Product_1.default.findOne({ sku: req.body.sku });
            if (existingProduct) {
                res.status(400).json({ message: 'Product with this SKU already exists' });
                return;
            }
        }
        if (req.body.barcode && req.body.barcode !== product.barcode) {
            const existingBarcode = await Product_1.default.findOne({ barcode: req.body.barcode });
            if (existingBarcode) {
                res.status(400).json({ message: 'Product with this barcode already exists' });
                return;
            }
        }
        Object.assign(product, req.body);
        await product.save();
        res.json(product);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map