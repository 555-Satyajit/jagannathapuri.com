"use strict";

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

    // Variable declaration for table
    var dt_user_table = $(".datatables-users"),
        select2 = $(".select2"),
        userView = "/admin/staff/view/",
        statusObj = {
            Active: { title: "Active", class: "bg-label-success" },
            Inactive: { title: "Inactive", class: "bg-label-secondary" }
        };

    if (select2.length) {
        var $this = select2;
        $this.wrap('<div class="position-relative"></div>').select2({
            placeholder: "Select Country",
            dropdownParent: $this.parent()
        });
    }


    // Users datatable
    if (dt_user_table.length) {
        var dt_user = dt_user_table.DataTable({
            // ajax: assetsPath + "json/staff-list.json", // Removed for SSR
            columns: [
                { data: "" },
                { data: "full_name" },
                { data: "role" },
                { data: "joining_date" },
                { data: "status" },
                { data: "action" }
            ],
            columnDefs: [
                {
                    // For Responsive
                    className: "control",
                    searchable: false,
                    orderable: false,
                    responsivePriority: 2,
                    targets: 0,
                    render: function (data, type, full, meta) {
                        return "";
                    }
                },
                {
                    // User full name and email
                    targets: 1,
                    responsivePriority: 4,
                    // Render function removed as EJS handles HTML
                },
                {
                    // User Role
                    targets: 2,
                    render: function (data, type, full, meta) {
                        var $role = data;
                        var roleBadgeObj = {
                            Support: 'border-info text-info',
                            Editor: 'border-warning text-warning',
                            Admin: 'border-primary text-primary',
                            Administrator: 'border-primary text-primary',
                            Manager: 'border-success text-success',
                            Restricted: 'border-danger text-danger',
                            'Managing Director': 'border-primary text-primary'
                        };
                        var roleIconObj = {
                            Support: 'bx-support',
                            Editor: 'bx-edit-alt',
                            Admin: 'bx-crown',
                            Administrator: 'bx-crown',
                            Manager: 'bx-user',
                            Restricted: 'bx-user-x',
                            'Managing Director': 'bx-briefcase'
                        };

                        var badgeClass = roleBadgeObj[$role] || 'border-secondary text-secondary';
                        var iconClass = roleIconObj[$role] || 'bx-user';

                        return '<span class="badge border ' + badgeClass + '"><i class="bx ' + iconClass + ' me-2"></i>' + $role + "</span>";
                    }
                },
                {
                    // Joining Date
                    targets: 3,
                    // Render function removed
                },
                {
                    // User Status
                    targets: 4,
                    // Render function removed
                },
                {
                    // Actions
                    targets: -1,
                    title: "Actions",
                    searchable: false,
                    orderable: false,
                    // Render function removed as EJS handles HTML
                }
            ],
            order: [[1, "desc"]],
            dom:
                '<"row mx-2"' +
                '<"col-md-2"<"me-3"l>>' +
                '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-nowrap flex-wrap gx-4"<"me-3"f>B>>' +
                ">t" +
                '<"row mx-2"' +
                '<"col-sm-12 col-md-6"i>' +
                '<"col-sm-12 col-md-6"p>' +
                ">",
            language: {
                sLengthMenu: "_MENU_",
                search: "",
                searchPlaceholder: "Search.."
            },
            // Buttons with Extra Options
            buttons: [
                {
                    extend: "collection",
                    className: "btn btn-label-secondary dropdown-toggle mx-3",
                    text: '<i class="bx bx-export me-1"></i>Export',
                    buttons: [
                        {
                            extend: "print",
                            text: '<i class="bx bx-printer me-2" ></i>Print',
                            className: "dropdown-item",
                            exportOptions: {
                                columns: [1, 2, 3, 4],
                                format: {
                                    body: function (inner, coldex, rowdex) {
                                        if (inner.length <= 0) return inner;
                                        var el = $.parseHTML(inner);
                                        var result = "";
                                        $.each(el, function (index, item) {
                                            if (item.classList !== undefined && item.classList.contains("user-name")) {
                                                result = result + item.lastChild.firstChild.textContent;
                                            } else if (item.innerText === undefined) {
                                                result = result + item.textContent;
                                            } else result = result + item.innerText;
                                        });
                                        return result;
                                    }
                                }
                            },
                            // ... export options kept same ...
                        }
                    ]
                },
                {
                    text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add New Staff</span>',
                    className: "add-new btn btn-primary",
                    attr: {
                        "data-bs-toggle": "offcanvas",
                        "data-bs-target": "#offcanvasAddUser"
                    }
                }
            ],
            // For responsive popup
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return "Details of " + data[1]; // data is array now
                        }
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        var data = $.map(columns, function (col, i) {
                            return col.title !== "" // ? Do not show for first column
                                ? '<tr data-dt-row="' +
                                col.rowIndex +
                                '" data-dt-column="' +
                                col.columnIndex +
                                '">' +
                                "<td>" +
                                col.title +
                                ":" +
                                "</td> " +
                                "<td>" +
                                col.data +
                                "</td>" +
                                "</tr>"
                                : "";
                        }).join("");

                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                }
            },
            initComplete: function () {
                // Adding role filter once table initialized
                this.api()
                    .columns(2)
                    .every(function () {
                        var column = this;
                        var select = $(
                            '<select id="UserRole" class="form-select text-capitalize"><option value=""> Select Role </option></select>'
                        )
                            .appendTo(".user_role")
                            .on("change", function () {
                                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                                column.search(val ? "^" + val + "$" : "", true, false).draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                // Strip HTML tags if any (from badges)
                                var val = stripHtml(d);
                                select.append('<option value="' + val + '">' + val + "</option>");
                            });
                    });
                // Adding status filter once table initialized
                this.api()
                    .columns(4)
                    .every(function () {
                        var column = this;
                        var select = $(
                            '<select id="FilterTransaction" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
                        )
                            .appendTo(".user_status")
                            .on("change", function () {
                                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                                column.search(val ? "^" + val + "$" : "", true, false).draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                // Strip HTML tags
                                var val = $(d).text().trim(); // Assuming badge HTML
                                select.append(
                                    '<option value="' +
                                    val +
                                    '" class="text-capitalize">' +
                                    val +
                                    "</option>"
                                );
                            });
                    });
            }
        });
    }

    // Helper to strip HTML
    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    // Edit Record
    $(".datatables-users tbody").on("click", ".edit-record", function () {
        // ... logic might need adjustment if data is array
        // For now, redirect logic relies on ID, which might not be in columns if hidden.
        // We put ID in view link in EJS.
        // Or we can extract it from the view link.
        var viewLink = $(this).closest('tr').find('a[href*="/admin/staff/view/"]').attr('href');
        if (viewLink) window.location.href = viewLink + '?action=edit';
    });

    // Delete Record
    $(".datatables-users tbody").on("click", ".delete-record", function () {
        dt_user.row($(this).parents("tr")).remove().draw();
    });

    // Filter form control to default size
    // ? To use Bootstrap default canvas with same search width
    setTimeout(() => {
        $(".dataTables_filter .form-control").removeClass("form-control-sm");
        $(".dataTables_length .form-select").removeClass("form-select-sm");
    }, 300);
});

// Validation
(function () {
    const addNewUserForm = document.getElementById("addNewUserForm");

    // Add New User Form Validation
    const fv = FormValidation.formValidation(addNewUserForm, {
        fields: {
            userFullname: {
                validators: {
                    notEmpty: {
                        message: "Please enter full name"
                    }
                }
            },
            userEmail: {
                validators: {
                    notEmpty: {
                        message: "Please enter your email"
                    },
                    emailAddress: {
                        message: "The value is not a valid email address"
                    }
                }
            },
            userRole: {
                validators: {
                    notEmpty: {
                        message: "Please select a role"
                    }
                }
            }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap5: new FormValidation.plugins.Bootstrap5({
                // Use this for enabling/disabling invalid/valid class on form control
                eleValidClass: "",
                rowSelector: function (field, ele) {
                    // field is the name of the field
                    // ele is the native HTML element
                    return ".mb-3";
                }
            }),
            submitButton: new FormValidation.plugins.SubmitButton(),
            // defaultSubmit: new FormValidation.plugins.DefaultSubmit(),
            autoFocus: new FormValidation.plugins.AutoFocus()
        }
    });

    fv.on('core.form.valid', function () {
        // Form is valid, submit via AJAX
        const formData = new FormData(addNewUserForm);
        const data = Object.fromEntries(formData.entries());

        // Show loading state if needed

        fetch('/admin/staff/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    // Show error
                    alert(result.error); // Replace with nice toast/alert
                } else {
                    // Success
                    // locaton.reload() or append to table
                    // For SSR simplicity, reload
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });
    });
})();
