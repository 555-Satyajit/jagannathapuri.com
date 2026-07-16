const express = require('express');
const router = express.Router();
const adminApiAuthController = require('../controllers/api/adminApiAuthController');
const adminAuth = require('../middlewares/adminAuth');
const checkPermission = require('../middlewares/checkPermission');

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
const dashboardController = require('../controllers/admin/dashboardController');
const adminApiSettingsController = require('../controllers/api/adminApiSettingsController');
const popupController = require('../controllers/api/popupController');
const newsletterController = require('../controllers/api/newsletterController');
const dailyRitualsController = require('../controllers/api/dailyRitualsController');
const manageHomeController = require('../controllers/api/manageHomeController');
const aiContentController = require('../controllers/admin/aiContentController');
const libraryController = require('../controllers/admin/libraryController');
const notificationController = require('../controllers/api/notificationController');

// Authentication routes
router.post('/auth/login', adminApiAuthController.apiPostLogin);
router.post('/auth/logout', adminApiAuthController.apiLogout);

// Notifications
router.post('/notifications/subscribe', adminAuth, notificationController.subscribeToPush);
router.get('/notifications/unread', adminAuth, notificationController.getUnreadNotifications);
router.post('/notifications/mark-read', adminAuth, notificationController.markAsRead);


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

// Library AI Generation
router.post('/library/ai-generate', adminAuth, aiContentController.apiGenerateLibraryContent);

// Library Categories
router.get('/library/categories/data', adminAuth, libraryController.getLibCategoryData);
router.post('/library/categories/save', adminAuth, upload.single('image'), libraryController.saveLibCategory);
router.post('/library/categories/update/:id', adminAuth, upload.single('image'), libraryController.saveLibCategory);
router.get('/library/categories/delete/:id', adminAuth, libraryController.deleteLibCategory);

// Library Content
router.get('/library/content/data', adminAuth, libraryController.getLibContentData);
router.post('/library/content/save', adminAuth, upload.single('image'), libraryController.saveLibContent);
router.post('/library/content/update/:id', adminAuth, upload.single('image'), libraryController.saveLibContent);
router.get('/library/content/delete/:id', adminAuth, libraryController.deleteLibContent);

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
router.get('/ecommerce/orders/invoice/:id', adminAuth, orderController.downloadInvoice);

// Transactions
router.get('/transactions/data', adminAuth, transactionController.getTransactionData);

// Settings
router.get('/settings/general', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiGetGeneralSettings);
router.post('/settings/general', adminAuth, checkPermission('manage_settings'), upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), adminApiSettingsController.apiSaveGeneralSettings);
router.get('/settings/store-contact', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiGetStoreContact);
router.post('/settings/store-contact', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiSaveStoreContact);
router.get('/settings/store-messages', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiGetStoreMessages);
router.delete('/settings/store-messages/:id', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiDeleteStoreMessage);
router.get('/settings/audit-logs/data', adminAuth, checkPermission('manage_settings'), dashboardController.getAuditLogsData);
router.get('/settings/policies/:type', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiGetPolicy);
router.post('/settings/policies/:type/save', adminAuth, checkPermission('manage_settings'), adminApiSettingsController.apiSavePolicy);

// Popups
router.get('/store/popups/data', adminAuth, popupController.getPopupsData);
router.post('/store/popups/save', adminAuth, upload.single('image'), popupController.savePopup);
router.post('/store/popups/update/:id', adminAuth, upload.single('image'), popupController.updatePopup);
router.post('/store/popups/toggle-status/:id', adminAuth, popupController.toggleStatusPopup);
router.get('/store/popups/delete/:id', adminAuth, popupController.deletePopup);

// Newsletter Routes
router.get('/store/newsletter/data', adminAuth, newsletterController.getNewsletters);
router.post('/store/newsletter/toggle-status/:id', adminAuth, newsletterController.toggleStatus);
router.get('/store/newsletter/delete/:id', adminAuth, newsletterController.deleteNewsletter);

// ==========================================
// STORE CONFIGURATION: DAILY RITUALS, DARSHAN & FACTS
// ==========================================
router.get('/store/rituals/data', adminAuth, dailyRitualsController.getRituals);
router.post('/store/rituals/save', adminAuth, dailyRitualsController.saveRitual);
router.post('/store/rituals/update/:id', adminAuth, dailyRitualsController.updateRitual);
router.get('/store/rituals/delete/:id', adminAuth, dailyRitualsController.deleteRitual);
router.post('/store/rituals/toggle-status/:id', adminAuth, dailyRitualsController.toggleRitualStatus);

router.get('/store/darshans/data', adminAuth, dailyRitualsController.getDarshans);
router.post('/store/darshans/save', adminAuth, dailyRitualsController.saveDarshan);
router.post('/store/darshans/update/:id', adminAuth, dailyRitualsController.updateDarshan);
router.get('/store/darshans/delete/:id', adminAuth, dailyRitualsController.deleteDarshan);
router.post('/store/darshans/toggle-status/:id', adminAuth, dailyRitualsController.toggleDarshanStatus);

router.get('/store/facts/data', adminAuth, dailyRitualsController.getFacts);
router.post('/store/facts/save', adminAuth, dailyRitualsController.saveFact);
router.post('/store/facts/update/:id', adminAuth, dailyRitualsController.updateFact);
router.get('/store/facts/delete/:id', adminAuth, dailyRitualsController.deleteFact);
router.post('/store/facts/toggle-status/:id', adminAuth, dailyRitualsController.toggleFactStatus);

// ==========================================
// STORE CONFIGURATION: MANAGE HOME
// ==========================================
router.get('/store/home/hero/data', adminAuth, manageHomeController.getHeroes);
router.post('/store/home/hero/save', adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), manageHomeController.saveHero);
router.post('/store/home/hero/update/:id', adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), manageHomeController.updateHero);
router.get('/store/home/hero/delete/:id', adminAuth, manageHomeController.deleteHero);
router.post('/store/home/hero/toggle-status/:id', adminAuth, manageHomeController.toggleHeroStatus);

router.get('/store/home/promo/data', adminAuth, manageHomeController.getPromos);
router.post('/store/home/promo/save', adminAuth, manageHomeController.savePromo);
router.post('/store/home/promo/update/:id', adminAuth, manageHomeController.updatePromo);
router.get('/store/home/promo/delete/:id', adminAuth, manageHomeController.deletePromo);
router.post('/store/home/promo/toggle-status/:id', adminAuth, manageHomeController.togglePromoStatus);

router.get('/store/home/hometab/data', adminAuth, manageHomeController.getHomeTabs);
router.post('/store/home/hometab/save', adminAuth, manageHomeController.saveHomeTab);
router.post('/store/home/hometab/update/:id', adminAuth, manageHomeController.updateHomeTab);
router.get('/store/home/hometab/delete/:id', adminAuth, manageHomeController.deleteHomeTab);
router.post('/store/home/hometab/toggle-status/:id', adminAuth, manageHomeController.toggleHomeTabStatus);
router.get('/store/home/hometab/categories', adminAuth, manageHomeController.getCategories);

router.get('/store/home/service/data', adminAuth, manageHomeController.getServices);
router.post('/store/home/service/save', adminAuth, upload.single('image'), manageHomeController.saveService);
router.post('/store/home/service/update/:id', adminAuth, upload.single('image'), manageHomeController.updateService);
router.get('/store/home/service/delete/:id', adminAuth, manageHomeController.deleteService);
router.post('/store/home/service/toggle-status/:id', adminAuth, manageHomeController.toggleServiceStatus);

module.exports = router;
