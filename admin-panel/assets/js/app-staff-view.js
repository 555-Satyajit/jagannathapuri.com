/**
 * Staff View Page Script
 */
'use strict';

$(function () {
    // Check for 'action=edit' in URL to auto-open the edit modal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'edit') {
        const editModalElement = document.getElementById('editUser');
        if (editModalElement) {
            const editModal = new bootstrap.Modal(editModalElement);
            editModal.show();

            // Optional: Remove the param from URL so refresh doesn't reopen it?
            // window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});
