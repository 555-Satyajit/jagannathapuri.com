"use strict";
$(function () {
    let t, a, s;
    s = (isDarkStyle
        ? ((t = config.colors_dark.borderColor),
            (a = config.colors_dark.bodyBg),
            config.colors_dark)
        : ((t = config.colors.borderColor),
            (a = config.colors.bodyBg),
            config.colors)
    ).headingColor;

    var e,
        n = $(".datatables-order"),
        r = {
            1: { title: "Pending", class: "bg-label-warning" },
            2: { title: "Processing", class: "bg-label-info" },
            3: { title: "Shipped", class: "bg-label-primary" },
            4: { title: "Delivered", class: "bg-label-success" },
            0: { title: "Cancelled", class: "bg-label-danger" },
        },
        o = {
            1: { title: "Paid", class: "text-success" },
            2: { title: "Pending", class: "text-warning" },
            3: { title: "Failed", class: "text-danger" },
            4: { title: "Cancelled", class: "text-secondary" },
        };

    if (n.length) {
        e = n.DataTable({
            ajax: "/admin/ecommerce/orders/data",
            columns: [
                { data: "id" },
                { data: "id" },
                { data: "order" },
                { data: "date" },
                { data: "customer" },
                { data: "payment" },
                { data: "status" },
                { data: "method" },
                { data: "" },
            ],
            columnDefs: [
                {
                    className: "control",
                    searchable: !1,
                    orderable: !1,
                    responsivePriority: 2,
                    targets: 0,
                    render: function (e, t, a, s) {
                        return "";
                    },
                },
                {
                    targets: 1,
                    orderable: !1,
                    checkboxes: {
                        selectAllRender: '<input type="checkbox" class="form-check-input">',
                    },
                    render: function () {
                        return '<input type="checkbox" class="dt-checkboxes form-check-input" >';
                    },
                    searchable: !1,
                },
                {
                    targets: 2,
                    render: function (e, t, a, s) {
                        return (
                            '<a href="/admin/ecommerce/orders/details/' +
                            a.id +
                            '"><span class="fw-medium">#' +
                            a.order +
                            "</span></a>"
                        );
                    },
                },
                {
                    targets: 3,
                    render: function (e, t, a, s) {
                        var n = new Date(a.date),
                            time = n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                            '<span class="text-nowrap">' +
                            n.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }) +
                            ", " +
                            time +
                            "</span>"
                        );
                    },
                },
                {
                    targets: 4,
                    responsivePriority: 1,
                    render: function (e, t, a, s) {
                        var n = a.customer,
                            r = a.email,
                            o = a.avatar;
                        return (
                            '<div class="d-flex justify-content-start align-items-center order-name text-nowrap"><div class="avatar-wrapper"><div class="avatar me-2">' +
                            (o
                                ? '<img src="' +
                                assetsPath +
                                "img/avatars/" +
                                o +
                                '" alt="Avatar" class="rounded-circle">'
                                : '<span class="avatar-initial rounded-circle bg-label-' +
                                [
                                    "success",
                                    "danger",
                                    "warning",
                                    "info",
                                    "dark",
                                    "primary",
                                    "secondary",
                                ][Math.floor(6 * Math.random())] +
                                '">' +
                                (o = (
                                    ((o = (n = a.customer).match(/\b\w/g) || []).shift() ||
                                        "") + (o.pop() || "")
                                ).toUpperCase()) +
                                "</span>") +
                            '</div></div><div class="d-flex flex-column"><h6 class="m-0"><a href="/admin/ecommerce/customers/details/' + a.customer_id + '" class="text-body">' +
                            n +
                            '</a></h6><small class="text-muted">' +
                            r +
                            "</small></div></div>"
                        );
                    },
                },
                {
                    targets: 5,
                    render: function (e, t, a, s) {
                        a = a.payment;
                        a = o[a];
                        return a
                            ? '<h6 class="mb-0 w-px-100 ' +
                            a.class +
                            '"><i class="bx bxs-circle fs-tiny me-2"></i>' +
                            a.title +
                            "</h6>"
                            : e;
                    },
                },
                {
                    targets: -3,
                    render: function (e, t, a, s) {
                        a = a.status;
                        return (
                            '<span class="badge px-2 ' +
                            r[a].class +
                            '" text-capitalized>' +
                            r[a].title +
                            "</span>"
                        );
                    },
                },
                {
                    targets: -2,
                    render: function (e, t, a, s) {
                        var n = a.method,
                            a = a.method_number;
                        return (
                            "paypal_logo" == n && (a = "@gmail.com"),
                            '<div class="d-flex align-items-center text-nowrap"><img src="' +
                            assetsPath +
                            "img/icons/payments/" +
                            n +
                            '.png" alt="' +
                            n +
                            '" class="me-2" width="16"><span><i class="bx bx-dots-horizontal-rounded"></i>' +
                            a +
                            "</span></div>"
                        );
                    },
                },
                {
                    targets: -1,
                    title: "Actions",
                    searchable: !1,
                    orderable: !1,
                    render: function (e, t, a, s) {
                        return (
                            '<div class="d-flex justify-content-sm-center align-items-sm-center"><button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button><div class="dropdown-menu dropdown-menu-end m-0"><a href="/admin/ecommerce/orders/details/' +
                            a.id +
                            '" class="dropdown-item">View</a><a href="/admin/ecommerce/invoices/view/' +
                            a.id +
                            '" class="dropdown-item">Invoice</a><a href="javascript:0;" class="dropdown-item delete-record">Delete</a></div></div>'
                        );
                    },
                },
            ],
            order: [3, "asc"],
            dom: '<"card-header d-flex flex-column flex-md-row align-items-start align-items-md-center"<f><"d-flex align-items-md-center justify-content-md-end mt-2 mt-md-0 ps-1 ms-1"l<"dt-action-buttons"B>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            lengthMenu: [10, 40, 60, 80, 100],
            language: {
                sLengthMenu: "_MENU_",
                search: "",
                searchPlaceholder: "Search Order",
                info: "Displaying _START_ to _END_ of _TOTAL_ entries",
            },
            buttons: [
                {
                    extend: "collection",
                    className: "btn btn-label-secondary dropdown-toggle me-3",
                    text: '<i class="bx bx-export me-1"></i>Export',
                    buttons: [
                        {
                            extend: "print",
                            text: '<i class="bx bx-printer me-2" ></i>Print',
                            className: "dropdown-item",
                            exportOptions: { columns: [2, 3, 4, 5, 6, 7] },
                        },
                        {
                            extend: "csv",
                            text: '<i class="bx bx-file me-2" ></i>Csv',
                            className: "dropdown-item",
                            exportOptions: { columns: [2, 3, 4, 5, 6, 7] },
                        },
                        {
                            extend: "excel",
                            text: '<i class="bx bxs-file-export me-2"></i>Excel',
                            className: "dropdown-item",
                            exportOptions: { columns: [2, 3, 4, 5, 6, 7] },
                        },
                        {
                            extend: "pdf",
                            text: '<i class="bx bxs-file-pdf me-2"></i>Pdf',
                            className: "dropdown-item",
                            exportOptions: { columns: [2, 3, 4, 5, 6, 7] },
                        },
                        {
                            extend: "copy",
                            text: '<i class="bx bx-copy me-2" ></i>Copy',
                            className: "dropdown-item",
                            exportOptions: { columns: [2, 3, 4, 5, 6, 7] },
                        },
                    ],
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (e) {
                            return "Details of " + e.data().customer;
                        },
                    }),
                    type: "column",
                    renderer: function (e, t, a) {
                        a = $.map(a, function (e, t) {
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
                        return !!a && $('<table class="table"/><tbody />').append(a);
                    },
                },
            },
        });
        $(".dataTables_length").addClass("mt-0 mt-md-3 me-3");
        $(".dt-action-buttons").addClass("pt-0");

        // Filter: Order Status (Column 6)
        $('#filter-status').on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            e.column(6).search(val ? '^' + val + '$' : '', true, false).draw();
        });

        // Filter: Payment Status (Column 5)
        $('#filter-payment').on('change', function () {
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            e.column(5).search(val ? '^' + val + '$' : '', true, false).draw();
        });

        // Clear Filters
        $('#clear-filters').on('click', function () {
            $('#filter-status').val('').trigger('change');
            $('#filter-payment').val('').trigger('change');
            e.search('').columns().search('').draw();
        });
    }

    // Fix listener for delete record
    $(".datatables-order tbody").on("click", ".delete-record", function () {
        var t = e.row($(this).parents("tr")),
            s = t.data();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert order!",
            icon: "warning",
            showCancelButton: !0,
            confirmButtonText: "Yes, Delete order!",
            customClass: { confirmButton: "btn btn-primary me-2", cancelButton: "btn btn-label-secondary" },
            buttonsStyling: !1
        }).then(function (a) {
            if (a.value) {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                fetch("/admin/ecommerce/orders/delete/" + s.id, {
                    method: "DELETE",
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    }
                })
                    .then(e => {
                        if (!e.ok) {
                            return e.text().then(text => {
                                throw new Error(text || `Server returned ${e.status}`);
                            });
                        }
                        return e.json();
                    })
                    .then(s => {
                        s.success ? (t.remove().draw(), Swal.fire({ icon: "success", title: "Deleted!", text: "Order has been removed.", customClass: { confirmButton: "btn btn-success" } })) : Swal.fire({ icon: "error", title: "Error!", text: s.error || "Failed to delete order.", customClass: { confirmButton: "btn btn-success" } })
                    }).catch(e => {
                        console.error('Delete error:', e);
                        Swal.fire({ icon: "error", title: "Error!", text: e.message || "An error occurred while deleting.", customClass: { confirmButton: "btn btn-success" } })
                    });
            } else a.dismiss === Swal.DismissReason.cancel && Swal.fire({ title: "Cancelled", text: "Cancelled Delete :)", icon: "error", customClass: { confirmButton: "btn btn-success" } })
        })
    });

    setTimeout(() => {
        $(".dataTables_filter .form-control").removeClass("form-control-sm"),
            $(".dataTables_length .form-select").removeClass("form-select-sm");
    }, 300);
});