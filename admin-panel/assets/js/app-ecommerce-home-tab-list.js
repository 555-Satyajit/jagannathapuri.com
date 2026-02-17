/**
 * App eCommerce Home Tab List
 */

'use strict';

// Datatable (jquery)
$(function () {
    let borderColor, bodyBg, headingColor;

    if (isDarkStyle) {
        borderColor = config.colors_dark.borderColor;
        bodyBg = config.colors_dark.bodyBg;
        headingColor = config.colors_dark.headingColor;
    } else {
        borderColor = config.colors.borderColor;
        bodyBg = config.colors.bodyBg;
        headingColor = config.colors.headingColor;
    }

    // Variable declaration for home tab list table
    var dt_home_tab_list_table = $('.datatables-home-tab-list');
    var select2 = $('.select2');

    if (select2.length) {
        select2.each(function () {
            var $this = $(this);
            $this.wrap('<div class="position-relative"></div>').select2({
                dropdownParent: $this.parent(),
                placeholder: $this.data('placeholder')
            });
        });
    }

    // DataTable
    if (dt_home_tab_list_table.length) {
        var dt_home_tab = dt_home_tab_list_table.DataTable({
            ajax: '/admin/store/home/tabs/data',
            columns: [
                { data: '' },
                { data: 'title' },
                { data: 'category.name' },
                { data: 'order' },
                { data: 'status' },
                { data: '' }
            ],
            columnDefs: [
                {
                    // For Responsive
                    className: 'control',
                    searchable: false,
                    orderable: false,
                    responsivePriority: 1,
                    targets: 0,
                    render: function (data, type, full, meta) {
                        return '';
                    }
                },
                {
                    // Title
                    targets: 1,
                    render: function (data, type, full, meta) {
                        return '<span class="fw-medium">' + full['title'] + '</span>';
                    }
                },
                {
                    // Category
                    targets: 2,
                    render: function (data, type, full, meta) {
                        return '<span>' + (full['category'] ? full['category']['name'] : 'N/A') + '</span>';
                    }
                },
                {
                    // Order
                    targets: 3,
                    render: function (data, type, full, meta) {
                        return '<span>' + full['order'] + '</span>';
                    }
                },
                {
                    // Status
                    targets: 4,
                    render: function (data, type, full, meta) {
                        var $status = full['status'];
                        return (
                            '<span class="badge ' +
                            ($status === 'Active' ? 'bg-label-success' : 'bg-label-secondary') +
                            '">' +
                            $status +
                            '</span>'
                        );
                    }
                },
                {
                    // Actions
                    targets: -1,
                    title: 'Actions',
                    searchable: false,
                    orderable: false,
                    render: function (data, type, full, meta) {
                        return (
                            '<div class="d-flex align-items-sm-center justify-content-sm-center">' +
                            '<button class="btn btn-sm btn-icon delete-record me-2" data-id="' + full['id'] + '"><i class="bx bx-trash"></i></button>' +
                            '<button class="btn btn-sm btn-icon edit-record" data-id="' + full['id'] + '" data-bs-toggle="offcanvas" data-bs-target="#offcanvasHomeTab"><i class="bx bx-edit"></i></button>' +
                            '</div>'
                        );
                    }
                }
            ],
            order: [3, 'asc'],
            dom:
                '<"card-header d-flex flex-wrap"<f><"d-flex justify-content-center justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex justify-content-center flex-md-row mb-3 mb-md-0 ps-1 ms-1 align-items-baseline gap-2"lB>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            language: {
                sLengthMenu: '_MENU_',
                search: '',
                searchPlaceholder: 'Search Tab'
            },
            buttons: [], // Already handled in HTML
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Details of ' + data['title'];
                        }
                    }),
                    type: 'column',
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== ''
                                ? '<tr data-dt-row="' +
                                col.rowIndex +
                                '" data-dt-column="' +
                                col.columnIndex +
                                '">' +
                                '<td> ' +
                                col.title +
                                ':' +
                                '</td> ' +
                                '<td class="ps-0">' +
                                col.data +
                                '</td>' +
                                '</tr>'
                                : '';
                        }).join('');

                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                }
            }
        });
    }

    // Delete Record
    $('.datatables-home-tab-list tbody').on('click', '.delete-record', function () {
        var id = $(this).data('id');
        if (confirm('Are you sure you want to delete this tab?')) {
            $.ajax({
                url: '/admin/store/home/tabs/delete/' + id,
                type: 'DELETE',
                success: function (res) {
                    if (res.success) {
                        dt_home_tab.ajax.reload();
                    } else {
                        alert('Error: ' + res.error);
                    }
                }
            });
        }
    });

    // Edit Record
    $('.datatables-home-tab-list tbody').on('click', '.edit-record', function () {
        var id = $(this).data('id');
        var rowData = dt_home_tab.row($(this).parents('tr')).data();

        $('#offcanvasHomeTabLabel').html('Edit Home Tab');
        $('.data-submit').html('Update');
        $('#home-tab-id').val(id);

        // Fill fields
        $('#home-tab-title').val(rowData.title);
        $('#home-tab-category').val(rowData.categoryId).trigger('change');
        $('#home-tab-order').val(rowData.order);
        $('#home-tab-status').val(rowData.status).trigger('change');
    });

    // Reset form on "Add New" button click
    $('.add-new').on('click', function () {
        $('#homeTabForm')[0].reset();
        $('#home-tab-id').val('');
        $('#offcanvasHomeTabLabel').html('Add Home Tab');
        $('.data-submit').html('Save');
        $('#home-tab-category').val('').trigger('change');
        $('#home-tab-status').val('Active').trigger('change');
    });
});

// Form Validation and Submission
(function () {
    const homeTabForm = document.getElementById('homeTabForm');

    const fv = FormValidation.formValidation(homeTabForm, {
        fields: {
            title: {
                validators: {
                    notEmpty: {
                        message: 'Please enter tab title'
                    }
                }
            },
            categoryId: {
                validators: {
                    notEmpty: {
                        message: 'Please select a category'
                    }
                }
            }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap5: new FormValidation.plugins.Bootstrap5({
                eleValidClass: 'is-valid',
                rowSelector: '.mb-3'
            }),
            submitButton: new FormValidation.plugins.SubmitButton(),
            autoFocus: new FormValidation.plugins.AutoFocus()
        }
    }).on('core.form.valid', function () {
        var formData = $(homeTabForm).serialize();

        $.ajax({
            url: '/admin/store/home/tabs/save',
            type: 'POST',
            data: formData,
            success: function (res) {
                if (res.success) {
                    var offcanvasEl = document.getElementById('offcanvasHomeTab');
                    var offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                    offcanvas.hide();

                    $('.datatables-home-tab-list').DataTable().ajax.reload();
                } else {
                    alert('Error: ' + res.error);
                }
            }
        });
    });
})();
