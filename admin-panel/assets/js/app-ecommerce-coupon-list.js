"use strict";

$(function () {
    let e, s, a;
    a = (isDarkStyle
        ? ((e = config.colors_dark.borderColor),
            (s = config.colors_dark.bodyBg),
            config.colors_dark)
        : ((e = config.colors.borderColor),
            (s = config.colors.bodyBg),
            config.colors)
    ).headingColor;

    var t,
        n = $(".datatables-coupons"),
        o = {
            Active: { title: "Active", class: "bg-label-success" },
            Inactive: { title: "Inactive", class: "bg-label-secondary" },
        };

    // Initialize DataTable if table exists
    if (n.length) {
        t = n.DataTable({
            // Assuming we are not using AJAX for now since we are rendering server-side EJS for the initial load
            // But if we want to use the JSON file directly like products, we can.
            // However, the implementation plan said "JSON Data Store" and the controller reads it.
            // Let's stick to the EJS loop for now as it's already in the template.
            // Wait, the template I wrote uses `coupons.forEach`.
            // So the DataTable will just enhance the existing table.
            dom: '<"card-header d-flex border-top rounded-0 flex-wrap py-md-0"<"me-5 ms-n2 pe-5"f><"d-flex justify-content-start justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex align-items-start align-items-md-center justify-content-sm-center mb-3 mb-sm-0"lB>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            lengthMenu: [7, 10, 20, 50, 70, 100],
            language: {
                sLengthMenu: "_MENU_",
                search: "",
                searchPlaceholder: "Search Coupon",
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
                            exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
                        },
                        {
                            extend: "csv",
                            text: '<i class="bx bx-file me-2" ></i>Csv',
                            className: "dropdown-item",
                            exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
                        },
                        {
                            extend: "excel",
                            text: '<i class="bx bxs-file-export me-2"></i>Excel',
                            className: "dropdown-item",
                            exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
                        },
                        {
                            extend: "pdf",
                            text: '<i class="bx bxs-file-pdf me-2"></i>Pdf',
                            className: "dropdown-item",
                            exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
                        },
                        {
                            extend: "copy",
                            text: '<i class="bx bx-copy me-2" ></i>Copy',
                            className: "dropdown-item",
                            exportOptions: { columns: [1, 2, 3, 4, 5, 6, 7] }
                        },
                    ],
                },
                {
                    text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Coupon</span>',
                    className: "add-new btn btn-primary",
                    action: function () {
                        window.location.href = "/admin/ecommerce/coupons/add";
                    },
                },
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (t) {
                            return "Details of " + t.data()[1]; // Coupon Code
                        },
                    }),
                    type: "column",
                    renderer: function (t, e, s) {
                        s = $.map(s, function (t, e) {
                            return "" !== t.title
                                ? '<tr data-dt-row="' +
                                t.rowIndex +
                                '" data-dt-column="' +
                                t.columnIndex +
                                '"><td>' +
                                t.title +
                                ":</td><td>" +
                                t.data +
                                "</td></tr>"
                                : "";
                        }).join("");
                        return !!s && $('<table class="table"/><tbody />').append(s);
                    },
                },
            },
            columnDefs: [
                {
                    className: "control",
                    searchable: !1,
                    orderable: !1,
                    responsivePriority: 2,
                    targets: 0,
                    render: function (t, e, s, a) {
                        return "";
                    },
                },
                {
                    targets: 7, // Status column (index 7 after adding usage limit and used count)
                    render: function (t, e, s, a) {
                        var status = $(t).text().trim(); // Get text from the span
                        if (o[status]) {
                            return '<span class="badge ' + o[status].class + '" text-capitalized>' + o[status].title + '</span>';
                        }
                        return t;
                    },
                }

            ]
        });
    }

    // Filter by Status
    // Note: Since I'm not using the complex column setup from product list which used AJAX data objects,
    // I might need to adjust how I attach the filter.
    // However, existing data is already in HTML.
    // Let's simplified filter.

    // Removed the complex initComplete for now as it relies on specific data structure.

    $(".dataTables_length").addClass("mt-0 mt-md-3 me-3");
    $(".dt-buttons").addClass("d-flex flex-wrap");


    // Fix listener for delete record
    $(".datatables-coupons tbody").on("click", ".delete-record", function () {
        var couponId = $(this).data('id');
        var row = $(this).parents("tr");

        if (confirm("Are you sure you want to delete this coupon?")) {
            fetch("/admin/ecommerce/coupons/delete/" + couponId, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        t.row(row).remove().draw();
                    } else {
                        alert('Error deleting coupon: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the coupon.');
                });
        }
    });


    setTimeout(() => {
        $(".dataTables_filter.form-control").removeClass("form-control-sm"),
            $(".dataTables_length.form-select").removeClass("form-select-sm");
    }, 300);
});
