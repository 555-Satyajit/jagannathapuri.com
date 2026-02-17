"use strict";

$(function () {
    var e = $(".datatables-permissions");

    // DataTable Initialization
    if (e.length) {
        e.DataTable({
            dom:
                '<"row mx-1"<"col-sm-12 col-md-3" l><"col-sm-12 col-md-9"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-md-end justify-content-center flex-wrap me-1"<"me-3"f>B>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            buttons: [
                {
                    text: "Add Permission",
                    className: "add-new btn btn-primary mb-3 mb-md-0",
                    attr: {
                        "data-bs-toggle": "modal",
                        "data-bs-target": "#addPermissionModal"
                    },
                    init: function (e, a, t) {
                        $(a).removeClass("btn-secondary");
                    }
                }
            ],
            language: {
                sLengthMenu: "_MENU_",
                search: "Search",
                searchPlaceholder: "Search.."
            },
            columnDefs: [
                { orderable: false, targets: -1 } // Disable sorting on Actions column
            ]
        });
    }

    // Handle Add Permission Form
    const addPermissionForm = document.getElementById('addPermissionForm');
    if (addPermissionForm) {
        const fv = FormValidation.formValidation(addPermissionForm, {
            fields: {
                modalPermissionName: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter a permission name'
                        }
                    }
                }
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap5: new FormValidation.plugins.Bootstrap5({
                    eleValidClass: '',
                    rowSelector: '.col-12'
                }),
                submitButton: new FormValidation.plugins.SubmitButton(),
                autoFocus: new FormValidation.plugins.AutoFocus()
            }
        }).on('core.form.valid', function () {
            const formData = new FormData(addPermissionForm);
            const data = {
                modalPermissionName: formData.get('modalPermissionName')
            };

            fetch('/admin/permissions/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    if (result.error) {
                        alert(result.error);
                    } else {
                        // Close modal
                        const modal = bootstrap.Modal.getInstance(document.querySelector('#addPermissionModal'));
                        modal.hide();
                        location.reload();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while saving the permission.');
                });
        });
    }

    // Delete record handler
    $(".datatables-permissions tbody").on("click", ".delete-record", function () {
        if (confirm('Delete functionality not yet implemented in backend.')) {
            // TODO: Implement delete API call
        }
    });

});