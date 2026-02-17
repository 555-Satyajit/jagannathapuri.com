"use strict";

$(function () {
    const addRoleForm = $('#addRoleForm');
    const selectAll = $('#selectAll');
    const checkboxes = addRoleForm.find('input[type="checkbox"]').not('#selectAll');

    // Form Validation
    if (addRoleForm.length && typeof FormValidation !== 'undefined') {
        FormValidation.formValidation(addRoleForm[0], {
            fields: {
                modalRoleName: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter role name'
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
        });
    }

    // Select All functionality
    if (selectAll.length) {
        selectAll.on('change', function () {
            const isChecked = $(this).is(':checked');
            checkboxes.prop('checked', isChecked);
        });
    }

    // Update Select All state based on individual checkboxes
    checkboxes.on('change', function () {
        const totalCount = checkboxes.length;
        const checkedCount = checkboxes.filter(':checked').length;

        if (totalCount === checkedCount) {
            selectAll.prop('checked', true);
            selectAll.prop('indeterminate', false);
        } else if (checkedCount === 0) {
            selectAll.prop('checked', false);
            selectAll.prop('indeterminate', false);
        } else {
            selectAll.prop('checked', false);
            selectAll.prop('indeterminate', true);
        }
    });
});