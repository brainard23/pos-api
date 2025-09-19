"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const products_1 = __importDefault(require("./routes/products"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const investors_1 = __importDefault(require("./routes/investors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/products', products_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/investors', investors_1.default);
app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to POS System API' });
});
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    scheduleMonthlyInvestorEmail();
});
function scheduleMonthlyInvestorEmail() {
    let lastNotifiedMonth = null;
    const checkAndRun = () => {
        const now = new Date();
        const isFirstDay = now.getDate() === 1;
        const monthKey = now.getFullYear() * 100 + now.getMonth();
        if (isFirstDay && monthKey !== lastNotifiedMonth) {
            console.log('[Investors] Monthly notification job triggered', now.toISOString());
            lastNotifiedMonth = monthKey;
        }
    };
    checkAndRun();
    setInterval(checkAndRun, 60 * 60 * 1000);
}
//# sourceMappingURL=server.js.map