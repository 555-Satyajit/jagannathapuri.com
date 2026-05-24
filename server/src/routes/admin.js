const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/adminAuth');
const checkPermission = require('../middlewares/checkPermission');
const notificationMiddleware = require('../middlewares/notificationMiddleware');
const { csrfProtection } = require('../middlewares/csrfMiddleware');

// Import Modular Controllers
const auth = require('../controllers/admin/adminAuthController');
const dashboard = require('../controllers/admin/dashboardController');
const category = require('../controllers/admin/categoryController');
const product = require('../controllers/admin/productController');
const order = require('../controllers/admin/orderController');
const customer = require('../controllers/admin/customerController');
const attribute = require('../controllers/admin/attributeController');
const coupon = require('../controllers/admin/couponController');
const transaction = require('../controllers/admin/transactionController');
const ticket = require('../controllers/admin/ticketController');
const staff = require('../controllers/admin/staffController');
const role = require('../controllers/admin/roleController');
const settings = require('../controllers/admin/settingsController');
const policy = require('../controllers/admin/policyController');
const home = require('../controllers/admin/homeController');
const temple = require('../controllers/admin/templeController');
const library = require('../controllers/admin/libraryController');

// Admin Login (Public)
router.get('/login', auth.getLogin);
router.post('/login', auth.postLogin);
router.get('/logout', auth.logout);

// Protect all subsequent routes
router.use(authMiddleware);
router.use(notificationMiddleware); // Inject notifications for all admin pages

// Notifications
router.get('/notifications/read/:id', dashboard.markNotificationRead);
router.delete('/notifications/delete/:id', dashboard.deleteNotification);

// Admin Dashboard
router.get('/', dashboard.getDashboard);
router.get('/engagement', dashboard.getEngagementAnalytics);

// eCommerce
router.get('/ecommerce/categories', checkPermission('manage_products'), category.getCategoryList);
router.get('/ecommerce/categories/data', checkPermission('manage_products'), category.getCategoryData);
router.post('/ecommerce/categories/save', checkPermission('manage_products'), upload.single('categoryImage'), csrfProtection, category.saveCategory);
router.post('/ecommerce/categories/update/:id', checkPermission('manage_products'), upload.single('categoryImage'), csrfProtection, category.updateCategory);
router.delete('/ecommerce/categories/delete/:id', checkPermission('manage_products'), category.deleteCategory);
router.post('/ecommerce/categories/bulk-delete', checkPermission('manage_products'), category.bulkDeleteCategories);

router.get('/ecommerce/attributes', checkPermission('manage_products'), attribute.getAttributeList);
router.post('/ecommerce/attributes', checkPermission('manage_products'), attribute.saveAttribute);
router.post('/ecommerce/attributes/edit/:id', checkPermission('manage_products'), attribute.updateAttribute);
router.delete('/ecommerce/attributes/delete/:id', checkPermission('manage_products'), attribute.deleteAttribute);
// Product Routes
router.get('/ecommerce/products', checkPermission('manage_products'), product.getProductList);
router.get('/ecommerce/products/data', checkPermission('manage_products'), product.getProductData);
router.get('/ecommerce/products/add', checkPermission('manage_products'), product.addProduct);
router.post('/ecommerce/products/add', checkPermission('manage_products'), upload.array('product_images', 10), csrfProtection, product.saveProduct);
router.get('/ecommerce/products/edit/:id', checkPermission('manage_products'), product.editProduct);
router.post('/ecommerce/products/edit/:id', checkPermission('manage_products'), upload.array('product_images', 10), csrfProtection, product.updateProduct);
router.delete('/ecommerce/products/delete/:id', checkPermission('manage_products'), product.deleteProduct);
router.post('/ecommerce/products/bulk-delete', checkPermission('manage_products'), product.bulkDeleteProducts);
router.get('/ecommerce/products/view/:id', checkPermission('manage_products'), product.viewProduct);
router.get('/ecommerce/products/debug/:id', checkPermission('manage_products'), product.debugProduct);

// Coupons
router.get('/ecommerce/coupons', checkPermission('manage_products'), coupon.getCouponList);
router.get('/ecommerce/coupons/add', checkPermission('manage_products'), coupon.addCoupon);
router.post('/ecommerce/coupons/add', checkPermission('manage_products'), csrfProtection, coupon.saveCoupon);
router.get('/ecommerce/coupons/edit/:id', checkPermission('manage_products'), coupon.editCoupon);
router.post('/ecommerce/coupons/edit/:id', checkPermission('manage_products'), csrfProtection, coupon.updateCoupon);
router.delete('/ecommerce/coupons/delete/:id', checkPermission('manage_products'), csrfProtection, coupon.deleteCoupon);

// Orders
router.get('/ecommerce/orders', checkPermission('manage_orders'), order.getOrderList);
router.get('/ecommerce/orders/data', checkPermission('manage_orders'), order.getOrderData);
router.delete('/ecommerce/orders/delete/:id', checkPermission('manage_orders'), order.deleteOrder);
router.patch('/ecommerce/orders/update-status/:id', checkPermission('manage_orders'), order.updateOrderStatus);
router.get('/ecommerce/orders/details/:id', checkPermission('manage_orders'), order.getOrderDetails);
router.get('/ecommerce/orders/invoice/:id', checkPermission('manage_orders'), order.downloadInvoice);
router.get('/ecommerce/invoices/view/:id', checkPermission('manage_orders'), order.getInvoice);

// Customer Management
router.get('/ecommerce/customers', checkPermission('manage_customers'), customer.getCustomerList);
router.get('/ecommerce/customers/data', checkPermission('manage_customers'), customer.getCustomerData);
router.post('/ecommerce/customers/add', checkPermission('manage_customers'), customer.saveCustomer);
router.get('/ecommerce/customers/details/:id', checkPermission('manage_customers'), customer.getCustomerDetails);
router.get('/ecommerce/customers/details/:id/orders', checkPermission('manage_customers'), customer.getCustomerOrdersData);
router.get('/ecommerce/customers/details/:id/:tab', checkPermission('manage_customers'), customer.getCustomerDetails);
router.delete('/ecommerce/customers/delete/:id', checkPermission('manage_customers'), customer.deleteCustomer);

// Transactions
router.get('/ecommerce/transactions', checkPermission('manage_transactions'), transaction.getTransactionList);
router.get('/ecommerce/transactions/data', checkPermission('manage_transactions'), transaction.getTransactionData);
router.get('/roles', checkPermission('manage_staff'), role.getRoleList);
router.get('/roles/staff/data', checkPermission('manage_staff'), role.getStaffRolesData);
router.post('/roles/add', checkPermission('manage_staff'), role.saveRole);
router.get('/permissions', checkPermission('manage_staff'), role.getPermissionList);
router.post('/permissions/add', checkPermission('manage_staff'), role.savePermission);
router.get('/staff', checkPermission('manage_staff'), staff.getStaffList);
router.post('/staff/add', checkPermission('manage_staff'), staff.saveStaff);
router.get('/staff/view/:id', checkPermission('manage_staff'), staff.getStaffView);
router.post('/staff/update', checkPermission('manage_staff'), staff.updateStaff);
// Tickets
router.get('/tickets/list', checkPermission('manage_customers'), ticket.getTicketList);
router.get('/tickets/data', checkPermission('manage_customers'), ticket.getTicketData);
router.post('/tickets/add', checkPermission('manage_customers'), upload.array('attachments', 10), csrfProtection, ticket.saveTicket);
router.get('/tickets/view/:id', checkPermission('manage_customers'), ticket.getTicketView);
router.post('/tickets/action', checkPermission('manage_customers'), upload.array('attachments', 10), csrfProtection, ticket.performTicketAction);

// Settings
router.get('/settings/general', checkPermission('manage_store_config'), settings.getGeneralSettings);
router.post('/settings/general', checkPermission('manage_store_config'), upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), csrfProtection, settings.saveGeneralSettings);
router.get('/settings/shipping-payment', checkPermission('manage_store_config'), settings.getShippingPaymentSettings);
router.post('/settings/shipping-payment', checkPermission('manage_store_config'), settings.saveShippingPaymentSettings);

// Audit Logs
router.get('/settings/audit-logs', checkPermission('manage_settings'), dashboard.getAuditLogs);
router.get('/settings/audit-logs/data', checkPermission('manage_settings'), dashboard.getAuditLogsData);

// Store Configuration - Manage Home
// Hero Section
router.get('/store/home/hero/list', checkPermission('manage_store_config'), home.getHeroList);
router.get('/store/home/hero/add', checkPermission('manage_store_config'), home.getAddHero);
router.get('/store/home/hero/edit/:id', checkPermission('manage_store_config'), home.getEditHero);
router.post('/store/home/hero/save', checkPermission('manage_store_config'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), csrfProtection, home.saveHero);
router.delete('/store/home/hero/delete/:id', checkPermission('manage_store_config'), home.deleteHero);

// Promo Banner
router.get('/store/home/promo/list', checkPermission('manage_store_config'), home.getPromoList);
router.get('/store/home/promo/add', checkPermission('manage_store_config'), home.getAddPromo);
router.get('/store/home/promo/edit/:id', checkPermission('manage_store_config'), home.getEditPromo);
router.post('/store/home/promo/save', checkPermission('manage_store_config'), home.savePromo);
router.delete('/store/home/promo/delete/:id', checkPermission('manage_store_config'), home.deletePromo);

// Pilgrimage Services
router.get('/store/home/service/list', checkPermission('manage_store_config'), home.getServiceList);
router.get('/store/home/service/add', checkPermission('manage_store_config'), home.getAddService);
router.get('/store/home/service/edit/:id', checkPermission('manage_store_config'), home.getEditService);
router.post('/store/home/service/save', checkPermission('manage_store_config'), upload.single('image'), csrfProtection, home.saveService);
router.delete('/store/home/service/delete/:id', checkPermission('manage_store_config'), home.deleteService);

// Home Tabs
router.get('/store/home/tabs/list', checkPermission('manage_store_config'), home.getHomeTabList);
router.get('/store/home/tabs/data', checkPermission('manage_store_config'), home.getHomeTabData);
router.post('/store/home/tabs/save', checkPermission('manage_store_config'), home.saveHomeTab);
router.delete('/store/home/tabs/delete/:id', checkPermission('manage_store_config'), home.deleteHomeTab);

// Manage Library
// Categories
router.get('/library/categories', checkPermission('manage_store_config'), library.getLibCategoryList);
router.get('/library/categories/data', checkPermission('manage_store_config'), library.getLibCategoryData);
router.post('/library/categories/save', checkPermission('manage_store_config'), upload.single('image'), csrfProtection, library.saveLibCategory);
router.delete('/library/categories/delete/:id', checkPermission('manage_store_config'), library.deleteLibCategory);

// Content
router.get('/library/content', checkPermission('manage_store_config'), library.getLibContentList);
router.get('/library/content/data', checkPermission('manage_store_config'), library.getLibContentData);
router.get('/library/content/add', checkPermission('manage_store_config'), library.getAddLibContent);
router.get('/library/content/edit/:id', checkPermission('manage_store_config'), library.getEditLibContent);
router.post('/library/content/save', checkPermission('manage_store_config'), upload.single('image'), csrfProtection, library.saveLibContent);
router.delete('/library/content/delete/:id', checkPermission('manage_store_config'), library.deleteLibContent);

// Manage Contact
router.get('/store/contact', checkPermission('manage_store_config'), settings.getContactSettings);
router.post('/store/contact/save', checkPermission('manage_store_config'), settings.saveContactSettings);
router.get('/store/contact/messages', checkPermission('manage_store_config'), settings.getContactMessages);
router.delete('/store/contact/messages/delete/:id', checkPermission('manage_store_config'), settings.deleteContactMessage);

// Manage Policies
router.get('/settings/policies/privacy', checkPermission('manage_settings'), policy.getPrivacyPolicy);
router.post('/settings/policies/privacy/save', checkPermission('manage_settings'), policy.savePrivacyPolicy);
router.get('/settings/policies/terms', checkPermission('manage_settings'), policy.getTermsConditions);
router.post('/settings/policies/terms/save', checkPermission('manage_settings'), policy.saveTermsConditions);
router.get('/settings/policies/return', checkPermission('manage_settings'), policy.getReturnPolicy);
router.post('/settings/policies/return/save', checkPermission('manage_settings'), policy.saveReturnPolicy);

// Manage Daily Rituals
router.get('/daily-rituals', checkPermission('manage_store_config'), temple.getDailyRitualsAdmin);

// Rituals CRUD
router.post('/daily-rituals/save', checkPermission('manage_store_config'), temple.saveRitual);
router.delete('/daily-rituals/delete/:id', checkPermission('manage_store_config'), temple.deleteRitual);

// Darshan Timings CRUD
router.post('/darshan-timings/save', checkPermission('manage_store_config'), temple.saveDarshanTiming);
router.delete('/darshan-timings/delete/:id', checkPermission('manage_store_config'), temple.deleteDarshanTiming);

// Temple Facts CRUD
router.post('/temple-facts/save', checkPermission('manage_store_config'), temple.saveTempleFact);
router.delete('/temple-facts/delete/:id', checkPermission('manage_store_config'), temple.deleteTempleFact);

// Manage Panchang
router.get('/panchang', checkPermission('manage_store_config'), temple.getPanchangList);
router.get('/panchang/add', checkPermission('manage_store_config'), temple.getAddPanchang);
router.get('/panchang/edit/:id', checkPermission('manage_store_config'), temple.getEditPanchang);
router.post('/panchang/save', checkPermission('manage_store_config'), temple.savePanchang);
router.delete('/panchang/delete/:id', checkPermission('manage_store_config'), temple.deletePanchang);

// Manage Festivals
router.get('/festivals', checkPermission('manage_store_config'), temple.getFestivalList);
router.post('/festivals/save', checkPermission('manage_store_config'), temple.saveFestival);
router.delete('/festivals/delete/:id', checkPermission('manage_store_config'), temple.deleteFestival);

// Manage Popups
router.get('/store/popup/list', checkPermission('manage_store_config'), home.getPopupList);
router.post('/store/popup/save', checkPermission('manage_store_config'), upload.single('popupImage'), csrfProtection, home.savePopup);
router.delete('/store/popup/delete/:id', checkPermission('manage_store_config'), home.deletePopup);

// Quill Image Upload
router.post('/library/content/upload-image', checkPermission('manage_store_config'), upload.single('image'), csrfProtection, library.uploadLibraryImage);

// Tags API (for select2)
router.get('/library/tags/search', checkPermission('manage_store_config'), library.searchLibTags);

// Newsletter Management
router.get('/newsletter/list', checkPermission('manage_store_config'), home.getNewsletterList);
router.delete('/newsletter/delete/:id', checkPermission('manage_store_config'), home.deleteNewsletter);

module.exports = router;
