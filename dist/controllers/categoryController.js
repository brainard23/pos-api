"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategory = exports.getCategories = void 0;
const express_validator_1 = require("express-validator");
const Category_1 = __importDefault(require("../models/Category"));
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category_1.default.find().sort({ name: 1 });
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res, next) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.getCategory = getCategory;
const createCategory = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { name, description, parent } = req.body;
        const existingCategory = await Category_1.default.findOne({ name });
        if (existingCategory) {
            res.status(400).json({ message: 'Category with this name already exists' });
            return;
        }
        if (parent) {
            const parentCategory = await Category_1.default.findById(parent);
            if (!parentCategory) {
                res.status(400).json({ message: 'Parent category not found' });
                return;
            }
        }
        const category = new Category_1.default({
            name,
            description,
            parent
        });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        if (req.body.name && req.body.name !== category.name) {
            const existingCategory = await Category_1.default.findOne({ name: req.body.name });
            if (existingCategory) {
                res.status(400).json({ message: 'Category with this name already exists' });
                return;
            }
        }
        if (req.body.parent && req.body.parent !== category.parent) {
            const parentCategory = await Category_1.default.findById(req.body.parent);
            if (!parentCategory) {
                res.status(400).json({ message: 'Parent category not found' });
                return;
            }
        }
        Object.assign(category, req.body);
        await category.save();
        res.json(category);
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category_1.default.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        const hasChildren = await Category_1.default.exists({ parent: category._id });
        if (hasChildren) {
            res.status(400).json({ message: 'Cannot delete category with child categories' });
            return;
        }
        await category.deleteOne();
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=categoryController.js.map