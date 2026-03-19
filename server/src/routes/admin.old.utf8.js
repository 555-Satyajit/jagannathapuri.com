const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/checkPermission');
const notificationMiddleware = require('../middleware/notificationMiddleware');

// Admin Login (Public)
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

// Protect all subsequent routes
router.use(authMiddleware);
router.use(notificationMiddleware); // Inject notifications for all admin pages

// Notifications
router.get('/notifications/read/:id', adminController.markNotificationRead);
router.delete('/notifications/delete/:id', adminController.deleteNotification);

// Admin Dashboard
router.get('/', adminController.getDashboard);
router.get('/engagement', adminController.getEngagementAnalytics);

// eCommerce
router.get('/ecommerce/categories', checkPermission('manage_products'), adminController.getCategoryList);
router.get('/ecommerce/categories/data', checkPermission('manage_products'), adminController.getCategoryData);
router.post('/ecommerce/categories/save', checkPermission('manage_products'), upload.single('categoryImage'), adminController.saveCategory);
router.post('/ecommerce/categories/update/:id', checkPermission('manage_products'), upload.single('categoryImage'), adminController.updateCategory);
router.delete('/ecommerce/categories/delete/:id', checkPermission('manage_products'), adminController.deleteCategory);
router.post('/ecommerce/categories/bulk-delete', checkPermission('manage_products'), adminController.bulkDeleteCategories);
router.get('/ecommerce/attributes', checkPermission('manage_products'), adminController.getAttributeList);
router.post('/ecommerce/attributes', checkPermission('manage_products'), adminController.saveAttribute);
router.post('/ecommerce/attributes/edit/:id', checkPermission('manage_products'), adminController.updateAttribute);
router.delete('/ecommerce/attributes/delete/:id', checkPermission('manage_products'), adminController.deleteAttribute);
// Product Routes
router.get('/ecommerce/products', checkPermission('manage_products'), adminController.getProductList);
router.get('/ecommerce/products/data', checkPermission('manage_products'), adminController.getProductData);
router.get('/ecommerce/products/add', checkPermission('manage_products'), adminController.addProduct);
router.post('/ecommerce/products/add', checkPermission('manage_products'), upload.array('product_images', 10), adminController.saveProduct);
router.get('/ecommerce/products/edit/:id', checkPermission('manage_products'), adminController.editProduct);
router.post('/ecommerce/products/edit/:id', checkPermission('manage_products'), upload.array('product_images', 10), adminController.updateProduct);
router.delete('/ecommerce/products/delete/:id', checkPermission('manage_products'), adminController.deleteProduct);
router.post('/ecommerce/products/bulk-delete', checkPermission('manage_products'), adminController.bulkDeleteProducts);
router.get('/ecommerce/products/view/:id', checkPermission('manage_products'), adminController.viewProduct);
router.get('/ecommerce/products/debug/:id', checkPermission('manage_products'), adminController.debugProduct);

// Coupons
router.get('/ecommerce/coupons', checkPermission('manage_products'), adminController.getCouponList);
router.get('/ecommerce/coupons/add', checkPermission('manage_products'), adminController.addCoupon);
router.post('/ecommerce/coupons/add', checkPermission('manage_products'), adminController.saveCoupon);
router.get('/ecommerce/coupons/edit/:id', checkPermission('manage_products'), adminController.editCoupon);
router.post('/ecommerce/coupons/edit/:id', checkPermission('manage_products'), adminController.updateCoupon);
router.delete('/ecommerce/coupons/delete/:id', checkPermission('manage_products'), adminController.deleteCoupon);

// Orders
router.get('/ecommerce/orders', checkPermission('manage_orders'), adminController.getOrderList);
router.get('/ecommerce/orders/data', checkPermission('manage_orders'), adminController.getOrderData);
router.delete('/ecommerce/orders/delete/:id', checkPermission('manage_orders'), adminController.deleteOrder);
router.patch('/ecommerce/orders/update-status/:id', checkPermission('manage_orders'), adminController.updateOrderStatus);
router.get('/ecommerce/orders/details/:id', checkPermission('manage_orders'), adminController.getOrderDetails);
router.get('/ecommerce/orders/invoice/:id', checkPermission('manage_orders'), adminController.downloadInvoice);
router.get('/ecommerce/invoices/view/:id', checkPermission('manage_orders'), adminController.getInvoice);

// Customer Management
router.get('/ecommerce/customers', checkPermission('manage_customers'), adminController.getCustomerList);
router.get('/ecommerce/customers/data', checkPermission('manage_customers'), adminController.getCustomerData);
router.post('/ecommerce/customers/add', checkPermission('manage_customers'), adminController.saveCustomer);
router.get('/ecommerce/customers/details/:id', checkPermission('manage_customers'), adminController.getCustomerDetails);
router.get('/ecommerce/customers/details/:id/orders', checkPermission('manage_customers'), adminController.getCustomerOrdersData);
router.get('/ecommerce/customers/details/:id/:tab', checkPermission('manage_customers'), adminController.getCustomerDetails);
router.delete('/ecommerce/customers/delete/:id', checkPermission('manage_customers'), adminController.deleteCustomer);

// Transactions
router.get('/ecommerce/transactions', checkPermission('manage_transactions'), adminController.getTransactionList);
router.get('/ecommerce/transactions/data', checkPermission('manage_transactions'), adminController.getTransactionData);
router.get('/roles', checkPermission('manage_staff'), adminController.getRoleList);
router.get('/roles/staff/data', checkPermission('manage_staff'), adminController.getStaffRolesData);
router.post('/roles/add', checkPermission('manage_staff'), adminController.saveRole);
router.get('/permissions', checkPermission('manage_staff'), adminController.getPermissionList);
router.post('/permissions/add', checkPermission('manage_staff'), adminController.savePermission);
router.get('/staff', checkPermission('manage_staff'), adminController.getStaffList);
router.post('/staff/add', checkPermission('manage_staff'), adminController.saveStaff);
router.get('/staff/view/:id', checkPermission('manage_staff'), adminController.getStaffView);
router.post('/staff/update', checkPermission('manage_staff'), adminController.updateStaff);
// Tickets
router.get('/tickets/list', checkPermission('manage_customers'), adminController.getTicketList);
router.get('/tickets/data', checkPermission('manage_customers'), adminController.getTicketData);
router.post('/tickets/add', checkPermission('manage_customers'), upload.array('attachments', 10), adminController.saveTicket);
router.get('/tickets/view/:id', checkPermission('manage_customers'), adminController.getTicketView);
router.post('/tickets/action', checkPermission('manage_customers'), upload.array('attachments', 10), adminController.performTicketAction);

// Settings
router.get('/settings/general', checkPermission('manage_store_config'), adminController.getGeneralSettings);
router.post('/settings/general', checkPermission('manage_store_config'), upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), adminController.saveGeneralSettings);
router.get('/settings/shipping-payment', checkPermission('manage_store_config'), adminController.getShippingPaymentSettings);
router.post('/settings/shipping-payment', checkPermission('manage_store_config'), adminController.saveShippingPaymentSettings);

// Audit Logs
router.get('/settings/audit-logs', checkPermission('manage_settings'), adminController.getAuditLogs);
router.get('/settings/audit-logs/data', checkPermission('manage_settings'), adminController.getAuditLogsData);

// Store Configuration - Manage Home
// Hero Section
router.get('/store/home/hero/list', checkPermission('manage_store_config'), adminController.getHeroList);
router.get('/store/home/hero/add', checkPermission('manage_store_config'), adminController.getAddHero);
router.get('/store/home/hero/edit/:id', checkPermission('manage_store_config'), adminController.getEditHero);
router.post('/store/home/hero/save', checkPermission('manage_store_config'), upload.single('image'), adminController.saveHero);
router.delete('/store/home/hero/delete/:id', checkPermission('manage_store_config'), adminController.deleteHero);

// Promo Banner
router.get('/store/home/promo/list', checkPermission('manage_store_config'), adminController.getPromoList);
router.get('/store/home/promo/add', checkPermission('manage_store_config'), adminController.getAddPromo);
router.get('/store/home/promo/edit/:id', checkPermission('manage_store_config'), adminController.getEditPromo);
router.post('/store/home/promo/save', checkPermission('manage_store_config'), adminController.savePromo);
router.delete('/store/home/promo/delete/:id', checkPermission('manage_store_config'), adminController.deletePromo);

// Pilgrimage Services
router.get('/store/home/service/list', checkPermission('manage_store_config'), adminController.getServiceList);
router.get('/store/home/service/add', checkPermission('manage_store_config'), adminController.getAddService);
router.get('/store/home/service/edit/:id', checkPermission('manage_store_config'), adminController.getEditService);
router.post('/store/home/service/save', checkPermission('manage_store_config'), upload.single('image'), adminController.saveService);
router.delete('/store/home/service/delete/:id', checkPermission('manage_store_config'), adminController.deleteService);

// Home Tabs
router.get('/store/home/tabs/list', checkPermission('manage_store_config'), adminController.getHomeTabList);
router.get('/store/home/tabs/data', checkPermission('manage_store_config'), adminController.getHomeTabData);
router.post('/store/home/tabs/save', checkPermission('manage_store_config'), adminController.saveHomeTab);
router.delete('/store/home/tabs/delete/:id', checkPermission('manage_store_config'), adminController.deleteHomeTab);

// Manage Library
// Categories
router.get('/library/categories', checkPermission('manage_store_config'), adminController.getLibCategoryList);
router.get('/library/categories/data', checkPermission('manage_store_config'), adminController.getLibCategoryData);
router.post('/library/categories/save', checkPermission('manage_store_config'), upload.single('image'), adminController.saveLibCategory);
router.delete('/library/categories/delete/:id', checkPermission('manage_store_config'), adminController.deleteLibCategory);

// Content
router.get('/library/content', checkPermission('manage_store_config'), adminController.getLibContentList);
router.get('/library/content/data', checkPermission('manage_store_config'), adminController.getLibContentData);
router.get('/library/content/add', checkPermission('manage_store_config'), adminController.getAddLibContent);
router.get('/library/content/edit/:id', checkPermission('manage_store_config'), adminController.getEditLibContent);
router.post('/library/content/save', checkPermission('manage_store_config'), upload.single('image'), adminController.saveLibContent);
router.delete('/library/content/delete/:id', checkPermission('manage_store_config'), adminController.deleteLibContent);

// Manage Contact
router.get('/store/contact', checkPermission('manage_store_config'), adminController.getContactSettings);
router.post('/store/contact/save', checkPermission('manage_store_config'), adminController.saveContactSettings);
router.get('/store/contact/messages', checkPermission('manage_store_config'), adminController.getContactMessages);
router.delete('/store/contact/messages/delete/:id', checkPermission('manage_store_config'), adminController.deleteContactMessage);

// Manage Policies
router.get('/settings/policies/privacy', checkPermission('manage_settings'), adminController.getPrivacyPolicy);
router.post('/settings/policies/privacy/save', checkPermission('manage_settings'), adminController.savePrivacyPolicy);
router.get('/settings/policies/terms', checkPermission('manage_settings'), adminController.getTermsConditions);
router.post('/settings/policies/terms/save', checkPermission('manage_settings'), adminController.saveTermsConditions);
router.get('/settings/policies/return', checkPermission('manage_settings'), adminController.getReturnPolicy);
router.post('/settings/policies/return/save', checkPermission('manage_settings'), adminController.saveReturnPolicy);

// Manage Daily Rituals
router.get('/daily-rituals', checkPermission('manage_store_config'), adminController.getDailyRitualsAdmin);

// Rituals CRUD
router.post('/daily-rituals/save', checkPermission('manage_store_config'), adminController.saveRitual);
router.delete('/daily-rituals/delete/:id', checkPermission('manage_store_config'), adminController.deleteRitual);

// Darshan Timings CRUD
router.post('/darshan-timings/save', checkPermission('manage_store_config'), adminController.saveDarshanTiming);
router.delete('/darshan-timings/delete/:id', checkPermission('manage_store_config'), adminController.deleteDarshanTiming);

// Temple Facts CRUD
router.post('/temple-facts/save', checkPermission('manage_store_config'), adminController.saveTempleFact);
router.delete('/temple-facts/delete/:id', checkPermission('manage_store_config'), adminController.deleteTempleFact);

// Manage Panchang
router.get('/panchang', checkPermission('manage_store_config'), adminController.getPanchangList);
router.get('/panchang/add', checkPermission('manage_store_config'), adminController.getAddPanchang);
router.get('/panchang/edit/:id', checkPermission('manage_store_config'), adminController.getEditPanchang);
router.post('/panchang/save', checkPermission('manage_store_config'), adminController.savePanchang);
router.delete('/panchang/delete/:id', checkPermission('manage_store_config'), adminController.deletePanchang);

// Manage Festivals
router.get('/festivals', checkPermission('manage_store_config'), adminController.getFestivalList);
router.post('/festivals/save', checkPermission('manage_store_config'), adminController.saveFestival);
router.delete('/festivals/delete/:id', checkPermission('manage_store_config'), adminController.deleteFestival);

// Manage Popups
router.get('/store/popup/list', checkPermission('manage_store_config'), adminController.getPopupList);
router.post('/store/popup/save', checkPermission('manage_store_config'), upload.single('popupImage'), adminController.savePopup);
router.delete('/store/popup/delete/:id', checkPermission('manage_store_config'), adminController.deletePopup);

// Quill Image Upload
router.post('/library/content/upload-image', checkPermission('manage_store_config'), upload.single('image'), adminController.uploadLibraryImage);

// Tags API (for select2)
router.get('/library/tags/search', checkPermission('manage_store_config'), adminController.searchLibTags);

// Newsletter Management
router.get('/newsletter/list', checkPermission('manage_store_config'), adminController.getNewsletterList);
router.delete('/newsletter/delete/:id', checkPermission('manage_store_config'), adminController.deleteNewsletter);

module.exports = router;
