"use strict";

$(function () {
    var e = $(".datatables-users"),
        l = {
            1: { title: "Pending", class: "bg-label-warning" },
            2: { title: "Active", class: "bg-label-success" },
            3: { title: "Inactive", class: "bg-label-secondary" }
        },
        c = "/admin/staff/view/";

    // DataTable Initialization
    if (e.length) {
        e.DataTable({
            ajax: "/admin/roles/staff/data",
            columns: [
                { data: "" },
                { data: "full_name" },
                { data: "role" },
                { data: "current_plan" },
                { data: "billing" },
                { data: "status" },
                { data: "" }
            ],
            columnDefs: [
                {
                    className: "control",
                    orderable: !1,
                    searchable: !1,
                    responsivePriority: 2,
                    targets: 0,
                    render: function (e, a, t, s) {
                        return "";
                    }
                },
                {
                    targets: 1,
                    responsivePriority: 4,
                    render: function (e, a, t, s) {
                        var l = t.full_name,
                            n = t.email,
                            r = t.avatar;
                        return (
                            '<div class="d-flex justify-content-left align-items-center"><div class="avatar-wrapper"><div class="avatar avatar-sm me-3">' +
                            (r
                                ? '<img src="' + assetsPath + "img/avatars/" + r + '" alt="Avatar" class="rounded-circle">'
                                : '<span class="avatar-initial rounded-circle bg-label-' +
                                ["success", "danger", "warning", "info", "dark", "primary", "secondary"][Math.floor(6 * Math.random()) + 1] +
                                '">' +
                                (r = (((r = (l = t.full_name).match(/\b\w/g) || []).shift() || "") + (r.pop() || "")).toUpperCase()) +
                                "</span>") +
                            '</div></div><div class="d-flex flex-column"><a href="' +
                            c +
                            t.id +
                            '" class="text-body text-truncate"><span class="fw-medium">' +
                            l +
                            '</span></a><small class="text-muted">@' +
                            n +
                            "</small></div></div>"
                        );
                    }
                },
                {
                    targets: 2,
                    render: function (e, a, t, s) {
                        var roleName = t.role;
                        var badgeStyles = {
                            Subscriber: 'bg-label-warning',
                            Author: 'bg-label-success',
                            Maintainer: 'bg-label-primary',
                            Editor: 'bg-label-info',
                            Admin: 'bg-label-secondary',
                            'Managing Director': 'bg-label-primary'
                        };
                        var icons = {
                            Subscriber: 'bx-user',
                            Author: 'bx-cog',
                            Maintainer: 'bx-pie-chart-alt',
                            Editor: 'bx-edit',
                            Admin: 'bx-mobile-alt',
                            'Managing Director': 'bx-briefcase'
                        };

                        var styleClass = badgeStyles[roleName] || 'bg-label-secondary';
                        var iconClass = icons[roleName] || 'bx-user';

                        return (
                            "<span class='text-truncate d-flex align-items-center'>" +
                            '<span class="badge badge-center rounded-pill ' + styleClass + ' w-px-30 h-px-30 me-2"><i class="bx ' + iconClass + ' bx-xs"></i></span>' +
                            roleName +
                            "</span>"
                        );
                    }
                },
                {
                    targets: 3,
                    render: function (e, a, t, s) {
                        return '<span class="fw-medium">' + t.current_plan + "</span>";
                    }
                },
                {
                    targets: 5,
                    render: function (e, a, t, s) {
                        t = t.status;
                        return '<span class="badge ' + l[t].class + '">' + l[t].title + "</span>";
                    }
                },
                {
                    targets: -1,
                    title: "View",
                    searchable: !1,
                    orderable: !1,
                    render: function (e, a, t, s) {
                        return '<a href="' + c + t.id + '" class="btn btn-sm btn-icon"><i class="bx bx-show-alt"></i></a>';
                    }
                }
            ],
            order: [[1, "desc"]],
            dom:
                '<"row mx-2"<"col-sm-12 col-md-4 col-lg-6" l><"col-sm-12 col-md-8 col-lg-6"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-md-end justify-content-center align-items-center flex-sm-nowrap flex-wrap me-1"<"me-3"f><"user_role w-px-200 pb-3 pb-sm-0">>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            language: {
                sLengthMenu: "_MENU_",
                search: "Search",
                searchPlaceholder: "Search.."
            },
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (e) {
                            return "Details of " + e.data().full_name;
                        }
                    }),
                    type: "column",
                    renderer: function (e, a, t) {
                        t = $.map(t, function (e, a) {
                            return "" !== e.title
                                ? '<tr data-dt-row="' +
                                e.rowIndex +
                                '" data-dt-column="' +
                                e.columnIndex +
                                '"><td>' +
                                e.title +
                                ":</td> <td>" +
                                e.data +
                                "</td></tr>"
                                : "";
                        }).join("");
                        return !!t && $('<table class="table"/><tbody />').append(t);
                    }
                }
            },
            initComplete: function () {
                this.api()
                    .columns(2)
                    .every(function () {
                        var a = this,
                            t = $(
                                '<select id="UserRole" class="form-select text-capitalize"><option value=""> Select Role </option></select>'
                            )
                                .appendTo(".user_role")
                                .on("change", function () {
                                    var e = $.fn.dataTable.util.escapeRegex($(this).val());
                                    a.search(e ? "^" + e + "$" : "", !0, !1).draw();
                                });
                        a.data()
                            .unique()
                            .sort()
                            .each(function (e, a) {
                                t.append('<option value="' + e + '" class="text-capitalize">' + e + "</option>");
                            });
                    });
            }
        });
    }

    // Handle Select All Checkbox
    const selectAll = document.querySelector('#selectAll');
    const checkboxList = document.querySelectorAll('[type="checkbox"][name="permissions[]"]');

    if (selectAll) {
        selectAll.addEventListener('change', t => {
            checkboxList.forEach(e => {
                e.checked = t.target.checked;
            });
        });
    }

    // Handle Add Role Form
    const addRoleForm = document.getElementById('addRoleForm');
    if (addRoleForm) {
        const fv = FormValidation.formValidation(addRoleForm, {
            fields: {
                modalRoleName: {
                    validators: {
                        notEmpty: {
                            message: 'Please enter a role name'
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
            const formData = new FormData(addRoleForm);
            // Manually collect checkbox values since they might not be in FormData if not checked (but we want checked ones)
            // Actually FormData does include checked checkboxes.
            // name="permissions[]" implies we get multiple values.

            const permissions = [];
            checkboxList.forEach(cb => {
                if (cb.checked) {
                    permissions.push(cb.value);
                }
            });

            Swal.fire({
                title: 'Saving...',
                text: 'Please wait while we save the role.',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            const data = {
                roleId: formData.get('modalRoleId'),
                modalRoleName: formData.get('modalRoleName'),
                permissions: permissions
            };

            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch('/admin/roles/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(text || `Server returned ${response.status}`);
                        });
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.error) {
                        Swal.fire({
                            title: 'Error!',
                            text: result.error,
                            icon: 'error',
                            customClass: {
                                confirmButton: 'btn btn-primary'
                            },
                            buttonsStyling: false
                        });
                    } else {
                        Swal.fire({
                            title: 'Success!',
                            text: result.message || 'Role saved successfully',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            location.reload();
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while saving the role.',
                        icon: 'error',
                        customClass: {
                            confirmButton: 'btn btn-primary'
                        },
                        buttonsStyling: false
                    });
                });
        });
    }

    // Handle Modal Title Toggle
    var roleEditModals = document.querySelectorAll(".role-edit-modal"),
        addNewRoleBtn = document.querySelector(".add-new-role"),
        roleTitle = document.querySelector(".role-title");

    if (addNewRoleBtn) {
        addNewRoleBtn.onclick = function () {
            roleTitle.innerHTML = "Add New Role";
            document.getElementById('modalRoleId').value = "";
            document.getElementById('modalRoleName').value = "";
            checkboxList.forEach(e => e.checked = false);
            if (selectAll) selectAll.checked = false;
        };
    }

    if (roleEditModals) {
        roleEditModals.forEach(function (e) {
            e.onclick = function () {
                roleTitle.innerHTML = "Edit Role";
                const roleId = this.getAttribute('data-id');
                const roleName = this.getAttribute('data-name');
                const rolePermissions = this.getAttribute('data-permissions').split(',');

                document.getElementById('modalRoleId').value = roleId;
                document.getElementById('modalRoleName').value = roleName;

                checkboxList.forEach(cb => {
                    cb.checked = rolePermissions.includes(cb.value);
                });
                
                // Update selectAll state
                if (selectAll) {
                    selectAll.checked = Array.from(checkboxList).every(cb => cb.checked);
                }
            };
        });
    }
});