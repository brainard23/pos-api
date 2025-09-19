"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = exports.getSupplier = exports.getSuppliers = void 0;
const express_validator_1 = require("express-validator");
const Supplier_1 = __importDefault(require("../models/Supplier"));
const getSuppliers = async (_req, res, next) => {
    try {
        const suppliers = await Supplier_1.default.find().sort({ name: 1 });
        res.json(suppliers);
    }
    catch (error) {
        next(error);
    }
};
exports.getSuppliers = getSuppliers;
const getSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier_1.default.findById(req.params.id);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        res.json(supplier);
    }
    catch (error) {
        next(error);
    }
};
exports.getSupplier = getSupplier;
const createSupplier = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { name, email, phone, address } = req.body;
        const existingSupplier = await Supplier_1.default.findOne({ email });
        if (existingSupplier) {
            res.status(400).json({ message: 'Supplier with this email already exists' });
            return;
        }
        const supplier = new Supplier_1.default({
            name,
            email,
            phone,
            address
        });
        await supplier.save();
        res.status(201).json(supplier);
    }
    catch (error) {
        next(error);
    }
};
exports.createSupplier = createSupplier;
const updateSupplier = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const supplier = await Supplier_1.default.findById(req.params.id);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        if (req.body.email && req.body.email !== supplier.email) {
            const existingSupplier = await Supplier_1.default.findOne({ email: req.body.email });
            if (existingSupplier) {
                res.status(400).json({ message: 'Supplier with this email already exists' });
                return;
            }
        }
        Object.assign(supplier, req.body);
        await supplier.save();
        res.json(supplier);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSupplier = updateSupplier;
const deleteSupplier = async (req, res, next) => {
    try {
        const supplier = await Supplier_1.default.findById(req.params.id);
        if (!supplier) {
            res.status(404).json({ message: 'Supplier not found' });
            return;
        }
        await supplier.deleteOne();
        res.json({ message: 'Supplier deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSupplier = deleteSupplier;
//# sourceMappingURL=supplierController.js.map