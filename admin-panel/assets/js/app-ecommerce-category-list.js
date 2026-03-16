/**
 * App eCommerce Category List
 */

'use strict';

// Comment editor
const commentEditor = document.querySelector('.comment-editor');
if (commentEditor) {
    new Quill(commentEditor, {
        modules: {
            toolbar: '.comment-toolbar'
        },
        placeholder: 'Enter category description...',
        theme: 'snow'
    });
}

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

    // Variable declaration for category list table
    var dt_category_list_table = $('.datatables-category-list');
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

    // select2 Category List (DataTable)
    if (dt_category_list_table.length) {
        var dt_category = dt_category_list_table.DataTable({
            ajax: '/admin/ecommerce/categories/data', // Changed to our new API endpoint
            columns: [
                // columns according to JSON
                { data: null, defaultContent: '' },
                { data: 'id' },
                { data: 'categories' },
                { data: 'total_products' },
                { data: 'total_earnings' },
                { data: 'status' },
                { data: null, defaultContent: '' }
            ],
            columnDefs: [
                {
                    // For Responsive
                    className: 'control',
                    searchable: false,
                    orderable: false,
                    responsivePriority: 20,
                    targets: 0,
                    render: function (data, type, full, meta) {
                        return '';
                    }
                },
                {
                    // For Checkboxes
                    targets: 1,
                    orderable: false,
                    searchable: false,
                    responsivePriority: 4,
                    checkboxes: {
                        selectAllRender: '<input type="checkbox" class="form-check-input">'
                    },
                    render: function () {
                        return '<input type="checkbox" class="dt-checkboxes form-check-input">';
                    }
                },
                {
                    // Categories and Category Detail
                    targets: 2,
                    responsivePriority: 1,
                    render: function (data, type, full, meta) {
                        var $name = full['categories'],
                            $category_detail = full['category_detail'],
                            $image = full['cat_image'],
                            $id = full['id'];
                        if ($image) {
                            // For Avatar image
                            var $output =
                                '<img src="/uploads/' + $image + '" alt="Category-' + $id + '" class="rounded-2">';
                        } else {
                            // For Avatar badge
                            var stateNum = Math.floor(Math.random() * 6);
                            var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                            var $state = states[stateNum],
                                $name = full['categories'],
                                $initials = $name.match(/\b\w/g) || [];
                            $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
                            $output = '<span class="avatar-initial rounded-2 bg-label-' + $state + '">' + $initials + '</span>';
                        }
                        // Fallback name
                        $name = $name || 'Unnamed';
                        // Creates full output for Categories
                        var $row_output =
                            '<div class="d-flex align-items-center">' +
                            '<div class="avatar-wrapper me-2 rounded-2 bg-label-secondary">' +
                            '<div class="avatar">' +
                            $output +
                            '</div>' +
                            '</div>' +
                            '<div class="d-flex flex-column justify-content-center">' +
                            '<span class="text-body text-wrap-force fw-medium">' +
                            $name +
                            '</span>' +
                            '<span class="text-muted line-clamp-2 mb-0 d-none d-sm-block"><small>' +
                            ($category_detail || '') +
                            '</small></span>' +
                            '</div>' +
                            '</div>';
                        return $row_output;
                    }
                },
                {
                    // Total products
                    targets: 3,
                    responsivePriority: 3,
                    render: function (data, type, full, meta) {
                        var $total_products = full['total_products'];
                        return '<div class="text-sm-end">' + $total_products + '</div>';
                    }
                },
                {
                    // Total Earnings
                    targets: 4,
                    orderable: false,
                    render: function (data, type, full, meta) {
                        var $total_earnings = full['total_earnings'];
                        return '<div class="fw-medium text-sm-end">' + $total_earnings + '</div>';
                    }
                },
                {
                    // Status
                    targets: 5,
                    render: function (data, type, full, meta) {
                        var $status = full['status'];
                        var roleBadgeObj = {
                            Publish: '<span class="badge bg-label-success">Publish</span>',
                            Scheduled: '<span class="badge bg-label-warning">Scheduled</span>',
                            Inactive: '<span class="badge bg-label-danger">Inactive</span>'
                        };
                        return (
                            '<div class="d-flex justify-content-center">' +
                            (roleBadgeObj[$status] || '<span class="badge bg-label-secondary">' + $status + '</span>') +
                            '</div>'
                        );
                    }
                },
                {
                    // Actions
                    targets: -1,
                    title: 'Actions',
                    searchable: false,
                    orderable: false,
                    responsivePriority: 1,
                    render: function (data, type, full, meta) {
                        return (
                            '<div class="d-flex align-items-sm-center justify-content-sm-center">' +
                            '<button class="btn btn-sm btn-icon delete-record me-2" data-id="' + full['id'] + '"><i class="bx bx-trash"></i></button>' +
                            '<button class="btn btn-sm btn-icon edit-record" data-id="' + full['id'] + '" data-bs-toggle="offcanvas" data-bs-target="#offcanvasEcommerceCategoryList"><i class="bx bx-edit"></i></button>' +
                            '</div>'
                        );
                    }
                }
            ],
            order: [2, 'desc'], //set any default order
            dom:
                '<"card-header d-flex flex-wrap"<f><"d-flex justify-content-center justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex justify-content-center flex-md-row mb-3 mb-md-0 ps-1 ms-1 align-items-baseline gap-2"lB>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            autoWidth: false,
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Details of ' + (data ? data['categories'] : 'Category');
                        }
                    }),
                    type: 'column',
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== '' // ? Do not show for first column
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
                                (col.data || '') +
                                '</td>' +
                                '</tr>'
                                : '';
                        }).join('');

                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                },
            },
            initComplete: function() {
                setTimeout(() => {
                    this.api().columns.adjust().responsive.recalc();
                }, 500);
            },
            lengthMenu: [7, 10, 20, 50, 70, 100], //for length of menu
            language: {
                sLengthMenu: '_MENU_',
                search: '',
                searchPlaceholder: 'Search Category'
            },
            // Button for offcanvas
            buttons: [
                {
                    text: '<i class="bx bx-trash me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Bulk Delete</span>',
                    className: 'btn btn-danger mx-3',
                    action: function (e, dt, node, config) {
                        var selectedIds = [];
                        $('.dt-checkboxes:checked').each(function() {
                            var rowData = dt.row($(this).closest('tr')).data();
                            if (rowData && rowData.id) {
                                selectedIds.push(rowData.id);
                            }
                        });

                        if (selectedIds.length === 0) {
                            Swal.fire({
                                title: "No Categories Selected",
                                text: "Please select at least one category to delete.",
                                icon: "warning",
                                customClass: {
                                    confirmButton: "btn btn-primary",
                                },
                                buttonsStyling: false,
                            });
                            return;
                        }

                        Swal.fire({
                            title: "Are you sure?",
                            text: "You won't be able to revert this!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete them!",
                            cancelButtonText: "Cancel",
                            customClass: {
                                confirmButton: "btn btn-danger me-3",
                                cancelButton: "btn btn-label-secondary",
                            },
                            buttonsStyling: false,
                        }).then(function (result) {
                            if (result.isConfirmed) {
                                $.ajax({
                                    url: '/admin/ecommerce/categories/bulk-delete',
                                    type: 'POST',
                                    data: JSON.stringify({ ids: selectedIds }),
                                    contentType: 'application/json',
                                    success: function (res) {
                                        if (res.success) {
                                            Swal.fire({
                                                icon: "success",
                                                title: "Deleted!",
                                                text: res.message,
                                                customClass: {
                                                    confirmButton: "btn btn-success",
                                                },
                                            });
                                            dt.ajax.reload(null, false);
                                        } else {
                                            Swal.fire({
                                                title: "Error",
                                                text: res.error,
                                                icon: "error",
                                                customClass: {
                                                    confirmButton: "btn btn-primary",
                                                },
                                            });
                                        }
                                    },
                                    error: function (err) {
                                        Swal.fire({
                                            title: "Error",
                                            text: "An error occurred during bulk deletion.",
                                            icon: "error",
                                            customClass: {
                                                confirmButton: "btn btn-primary",
                                            },
                                        });
                                    }
                                });
                            }
                        });
                    }
                },
                {
                    text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Category</span>',
                    className: 'add-new btn btn-primary',
                    attr: {
                        'data-bs-toggle': 'offcanvas',
                        'data-bs-target': '#offcanvasEcommerceCategoryList'
                    },
                    action: function (e, dt, node, config) {
                        // Reset form for adding
                        $('#eCommerceCategoryListForm')[0].reset();
                        $('#offcanvasEcommerceCategoryListLabel').html('Add Category');
                        $('.data-submit').html('Add');
                        $('#eCommerceCategoryListForm').attr('data-id', '');
                        if (commentEditor) commentEditor.querySelector('.ql-editor').innerHTML = '';
                    }
                }
            ],
            // Responsive settings
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Details of ' + data['categories'];
                        }
                    }),
                    type: 'column',
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== '' // ? Do not show for first column
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
        $('.dt-action-buttons').addClass('pt-0');
        $('.dataTables_filter').addClass('me-3 ps-0');
    }

    // Broaden listener for delete record (handles responsive modals)
    $(document).on('click', '.delete-record', function () {
        var id = $(this).data('id');
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: "btn btn-danger me-3",
                cancelButton: "btn btn-label-secondary",
            },
            buttonsStyling: false,
        }).then(function (result) {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/admin/ecommerce/categories/delete/' + id,
                    type: 'DELETE',
                    success: function (res) {
                        if (res.success) {
                            Swal.fire({
                                icon: "success",
                                title: "Deleted!",
                                text: "The category has been deleted.",
                                customClass: {
                                    confirmButton: "btn btn-success",
                                },
                            });
                            dt_category.ajax.reload(null, false);
                        } else {
                            Swal.fire({
                                title: "Error",
                                text: res.error,
                                icon: "error",
                                customClass: {
                                    confirmButton: "btn btn-primary",
                                },
                            });
                        }
                    },
                    error: function(err) {
                        Swal.fire({
                            title: "Error",
                            text: "An error occurred while deleting the category.",
                            icon: "error",
                            customClass: {
                                confirmButton: "btn btn-primary",
                            },
                        });
                    }
                });
            }
        });
    });

    // Edit Record (Broaden listener for responsive modals)
    $(document).on('click', '.edit-record', function () {
        var id = $(this).data('id');
        // Handle both main table and responsive child rows/modals
        var row = $(this).closest('tr');
        if (row.hasClass('child')) {
            row = row.prev();
        }
        var rowData = dt_category.row(row).data();
        
        if (!rowData) {
            // Fallback for modal which might not have the tr in parent hierarchy
            // We search the data by ID
            rowData = dt_category.rows().data().toArray().find(r => r.id == id);
        }

        $('#offcanvasEcommerceCategoryListLabel').html('Edit Category');
        $('.data-submit').html('Update');
        $('#eCommerceCategoryListForm').attr('data-id', id);

        // Fill fields
        $('#ecommerce-category-title').val(rowData.categories);
        $('#ecommerce-category-slug').val(rowData.slug);
        $('#ecommerce-category-status').val(rowData.status).trigger('change');
        // SEO Fields
        $('#meta_title').val(rowData.meta_title || '');
        $('#meta_description').val(rowData.meta_description || '');
        $('#meta_keywords').val(rowData.meta_keywords || '');

        // Initialize SEO meters
        if (typeof updateSeoMeter === 'function') {
            const titleInputSeo = document.getElementById('meta_title');
            const descInputSeo = document.getElementById('meta_description');
            if (titleInputSeo) updateSeoMeter(titleInputSeo, 100, 30, 60);
            if (descInputSeo) updateSeoMeter(descInputSeo, 300, 120, 160);
        }

        // Description
        if (commentEditor) commentEditor.querySelector('.ql-editor').innerHTML = rowData.category_detail;
    });

    // Filter form control to default size
    // ? To use Bootstrap default cell sizes, comment out below code
    setTimeout(() => {
        $('.dataTables_filter .form-control').removeClass('form-control-sm');
        $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);

    // SEO Strength Meter Logic
    window.updateSeoMeter = function (input, max, ideal_min, ideal_max) {
        const meter = input.nextElementSibling;
        if (!meter || !meter.classList.contains('seo-meter')) return;

        const label = meter.querySelector('.strength-label');
        const countDisplay = meter.querySelector('.char-count');
        const bar = meter.querySelector('.progress-bar');

        const count = input.value.length;
        countDisplay.textContent = count;

        let percent = (count / max) * 100;
        if (percent > 100) percent = 100;
        bar.style.width = percent + '%';

        if (count === 0) {
            label.textContent = 'Empty';
            label.className = 'strength-label text-muted';
            bar.className = 'progress-bar bg-secondary';
        } else if (count < ideal_min) {
            label.textContent = 'Weak';
            label.className = 'strength-label text-danger';
            bar.className = 'progress-bar bg-danger';
        } else if (count <= ideal_max) {
            label.textContent = 'Best';
            label.className = 'strength-label text-success';
            bar.className = 'progress-bar bg-success';
        } else {
            label.textContent = 'Good (Too long)';
            label.className = 'strength-label text-warning';
            bar.className = 'progress-bar bg-warning';
        }
    };

    const titleInputSeoCat = document.getElementById('meta_title');
    const descInputSeoCat = document.getElementById('meta_description');

    if (titleInputSeoCat) {
        titleInputSeoCat.addEventListener('input', () => updateSeoMeter(titleInputSeoCat, 100, 30, 60));
    }
    if (descInputSeoCat) {
        descInputSeoCat.addEventListener('input', () => updateSeoMeter(descInputSeoCat, 300, 120, 160));
    }

    // Auto-slug generation
    const titleInput = document.getElementById('ecommerce-category-title');
    const slugInput = document.getElementById('ecommerce-category-slug');

    if (titleInput && slugInput) {
        titleInput.addEventListener('input', function () {
            // Only auto-generate if the slug field is currently empty or matches a slugified version of the title
            // This allows users to manually override the slug if they want.
            const slug = titleInput.value
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special chars
                .replace(/[\s_-]+/g, '-') // Replace spaces/underscores/hyphens with a single hyphen
                .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

            slugInput.value = slug;
        });
    }
});

// Form Validation
(function () {
    const eCommerceCategoryListForm = document.getElementById('eCommerceCategoryListForm');

    // Add Category form validation
    const fv = FormValidation.formValidation(eCommerceCategoryListForm, {
        fields: {
            categoryTitle: {
                validators: {
                    notEmpty: {
                        message: 'Please enter category title'
                    }
                }
            },
            slug: {
                validators: {
                    notEmpty: {
                        message: 'Please enter slug'
                    }
                }
            }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap5: new FormValidation.plugins.Bootstrap5({
                // Use this for enabling/disabling invalid field tick
                eleValidClass: 'is-valid',
                rowSelector: function (field, ele) {
                    // field is the name of the field's element
                    // ele is the field's element
                    return '.mb-3';
                }
            }),
            submitButton: new FormValidation.plugins.SubmitButton(),
            // Submit the form when all fields are valid
            // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
            autoFocus: new FormValidation.plugins.AutoFocus()
        }
    }).on('core.form.valid', function () {
        // Send data to server
        var description = document.querySelector('.comment-editor .ql-editor').innerHTML;
        document.getElementById('hidden-description').value = description;
        var formData = new FormData(eCommerceCategoryListForm);

        var id = $('#eCommerceCategoryListForm').attr('data-id');
        var url = id ? '/admin/ecommerce/categories/update/' + id : '/admin/ecommerce/categories/save';

        // Loader implementation
        const submitBtn = $('.data-submit');
        const originalBtnText = submitBtn.html();
        submitBtn.html('<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Loading...').prop('disabled', true);

        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.success) {
                    // Close offcanvas
                    var offcanvasEl = document.getElementById('offcanvasEcommerceCategoryList');
                    var offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                    offcanvas.hide();

                    // Reload table
                    $('.datatables-category-list').DataTable().ajax.reload(null, false);
                    
                    // Reset button
                    submitBtn.html(originalBtnText).prop('disabled', false);
                } else {
                    Swal.fire({
                        title: "Error",
                        text: res.error,
                        icon: "error",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        },
                    });
                    submitBtn.html(originalBtnText).prop('disabled', false);
                }
            },
            error: function (err) {
                Swal.fire({
                    title: "Error",
                    text: "An error occurred while saving the category.",
                    icon: "error",
                    customClass: {
                        confirmButton: "btn btn-primary",
                    },
                });
                submitBtn.html(originalBtnText).prop('disabled', false);
            }
        });
    });
})();