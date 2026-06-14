const express = require('express');
const router = express.Router();
const adminApiAuthController = require('../controllers/api/adminApiAuthController');
const adminAuth = require('../middlewares/adminAuth');

// API Controllers
const { apiGetEngagementAnalytics, apiGetDashboardOverview } = require('../controllers/api/adminApiDashboardController');
const categoryController = require('../controllers/admin/categoryController');
const productController = require('../controllers/admin/productController');
const attributeController = require('../controllers/admin/attributeController');
const couponController = require('../controllers/admin/couponController');
const staffController = require('../controllers/admin/staffController');
const roleController = require('../controllers/admin/roleController');
const customerController = require('../controllers/admin/customerController');
const orderController = require('../controllers/admin/orderController');
const transactionController = require('../controllers/admin/transactionController');

// Authentication routes
router.post('/auth/login', adminApiAuthController.apiPostLogin);
router.post('/auth/logout', adminApiAuthController.apiLogout);

// Current user profile
router.get('/auth/me', adminAuth, adminApiAuthController.apiMe);

// Analytics & Dashboard
router.get('/analytics/engagement', adminAuth, apiGetEngagementAnalytics);
router.get('/dashboard/overview', adminAuth, apiGetDashboardOverview);

// Catalog Data
router.get('/ecommerce/categories/data', adminAuth, categoryController.getCategoryData);
router.get('/ecommerce/products/data', adminAuth, productController.getProductData);
router.get('/ecommerce/attributes/data', adminAuth, attributeController.getAttributeData);
router.get('/ecommerce/coupons/data', adminAuth, couponController.apiGetCouponData);

// Catalog CRUD
const upload = require('../middlewares/uploadMiddleware');
// Categories
router.post('/ecommerce/categories/save', adminAuth, upload.single('categoryImage'), categoryController.saveCategory);
router.post('/ecommerce/categories/update/:id', adminAuth, upload.single('categoryImage'), categoryController.updateCategory);
router.post('/ecommerce/categories/toggle-status/:id', adminAuth, categoryController.apiToggleStatus);
router.get('/ecommerce/categories/delete/:id', adminAuth, categoryController.deleteCategory);

// Products
router.get('/ecommerce/products/view/:id', adminAuth, productController.apiViewProduct);
router.post('/ecommerce/products/save', adminAuth, upload.array('product_images', 10), productController.saveProduct);
router.post('/ecommerce/products/update/:id', adminAuth, upload.array('product_images', 10), productController.updateProduct);
router.post('/ecommerce/products/toggle-status/:id', adminAuth, productController.apiToggleStatus);
router.get('/ecommerce/products/delete/:id', adminAuth, productController.deleteProduct);

// Attributes
router.post('/ecommerce/attributes/save', adminAuth, attributeController.apiSaveAttribute);
router.post('/ecommerce/attributes/update/:id', adminAuth, attributeController.apiUpdateAttribute);
router.get('/ecommerce/attributes/delete/:id', adminAuth, attributeController.deleteAttribute);

// Coupons
router.post('/ecommerce/coupons/save', adminAuth, couponController.apiSaveCoupon);
router.post('/ecommerce/coupons/update/:id', adminAuth, couponController.apiUpdateCoupon);
router.post('/ecommerce/coupons/toggle-status/:id', adminAuth, couponController.apiToggleStatus);
router.get('/ecommerce/coupons/delete/:id', adminAuth, couponController.deleteCoupon);

// Staff
router.get('/staff/data', adminAuth, staffController.apiGetStaffData);
router.post('/staff/save', adminAuth, staffController.saveStaff);
router.post('/staff/update/:id', adminAuth, staffController.apiUpdateStaff);
router.post('/staff/toggle-status/:id', adminAuth, staffController.apiToggleStatus);
router.get('/staff/delete/:id', adminAuth, staffController.deleteStaff);

// Roles
router.get('/roles/data', adminAuth, roleController.apiGetRolesData);
router.post('/roles/save', adminAuth, roleController.saveRole);
router.get('/roles/staff-data', adminAuth, roleController.getStaffRolesData);

// Permissions
router.get('/permissions/data', adminAuth, roleController.apiGetPermissionsData);
router.post('/permissions/save', adminAuth, roleController.savePermission);
router.post('/permissions/delete-module', adminAuth, roleController.deletePermissionModule);

// Customers
router.get('/customers/data', adminAuth, customerController.getCustomerData);
router.post('/customers/save', adminAuth, customerController.saveCustomer);
router.post('/customers/update/:id', adminAuth, customerController.updateCustomer);
router.get('/customers/delete/:id', adminAuth, customerController.deleteCustomer);
router.get('/customers/view/:id', adminAuth, customerController.getCustomerById);

// Orders
router.get('/ecommerce/orders/data', adminAuth, orderController.getOrderData);
router.get('/ecommerce/orders/delete/:id', adminAuth, orderController.deleteOrder);
router.post('/ecommerce/orders/update-status/:id', adminAuth, orderController.updateOrderStatus);
router.get('/ecommerce/orders/view/:id', adminAuth, orderController.apiGetOrderDetails);

// Transactions
router.get('/transactions/data', adminAuth, transactionController.getTransactionData);

module.exports = router;
