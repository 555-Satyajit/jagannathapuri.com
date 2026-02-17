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
    var dt_ticket_table = $(".datatables-tickets"),
        statusObj = {
            Open: { title: "Open", class: "bg-label-danger" },
            "In Progress": { title: "In Progress", class: "bg-label-warning" },
            Closed: { title: "Closed", class: "bg-label-success" }
        },
        priorityObj = {
            High: { title: "High", class: "bg-label-danger" },
            Medium: { title: "Medium", class: "bg-label-warning" },
            Low: { title: "Low", class: "bg-label-info" }
        };

    // Tickets datatable
    if (dt_ticket_table.length) {
        var dt_ticket = dt_ticket_table.DataTable({
            ajax: '/admin/tickets/data',
            columns: [
                // columns according to JSON
                { data: "" },
                { data: "ticket_id" },
                { data: "subject" },
                { data: "customer" },
                { data: "priority" },
                { data: "status" },
                { data: "created_at" },
                { data: "assignee" },
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
                    // Ticket ID
                    targets: 1,
                    render: function (data, type, full, meta) {
                        return '<span class="fw-medium">' + full["ticket_id"] + "</span>";
                    }
                },
                {
                    // Subject
                    targets: 2,
                    render: function (data, type, full, meta) {
                        return '<span class="text-nowrap">' + full["subject"] + "</span>";
                    }
                },
                {
                    // Customer
                    targets: 3,
                    render: function (data, type, full, meta) {
                        return '<span class="text-nowrap">' + full["customer"] + "</span>";
                    }
                },
                {
                    // Priority
                    targets: 4,
                    render: function (data, type, full, meta) {
                        var $priority = full["priority"];
                        return '<span class="badge ' + priorityObj[$priority].class + '">' + priorityObj[$priority].title + "</span>";
                    }
                },
                {
                    // Status
                    targets: 5,
                    render: function (data, type, full, meta) {
                        var $status = full["status"];
                        return '<span class="badge ' + statusObj[$status].class + '">' + statusObj[$status].title + "</span>";
                    }
                },
                {
                    // Created Date
                    targets: 6,
                    render: function (data, type, full, meta) {
                        return '<span class="text-nowrap">' + full["created_at"] + "</span>";
                    }
                },
                {
                    // Assignee
                    targets: 7,
                    render: function (data, type, full, meta) {
                        return '<span class="text-nowrap">' + full["assignee"] + "</span>";
                    }
                },
                {
                    // Actions
                    targets: -1,
                    title: "Actions",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, full, meta) {
                        return (
                            '<div class="d-inline-block text-nowrap">' +
                            '<button class="btn btn-sm btn-icon edit-record"><i class="bx bx-edit"></i></button>' +
                            '<button class="btn btn-sm btn-icon delete-record"><i class="bx bx-trash"></i></button>' +
                            '<button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>' +
                            '<div class="dropdown-menu dropdown-menu-end m-0">' +
                            '<a href="/admin/tickets/view/' + full.id + '" class="dropdown-item">View</a>' +
                            '<a href="javascript:;" class="dropdown-item">Assign</a>' +
                            "</div>" +
                            "</div>"
                        );
                    }
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
                                columns: [1, 2, 3, 4, 5, 6, 7]
                            }
                        },
                        {
                            extend: "csv",
                            text: '<i class="bx bx-file me-2" ></i>Csv',
                            className: "dropdown-item",
                            exportOptions: {
                                columns: [1, 2, 3, 4, 5, 6, 7]
                            }
                        }
                    ]
                },
                {
                    text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Ticket</span>',
                    className: "add-new btn btn-primary",
                    attr: {
                        "data-bs-toggle": "offcanvas",
                        "data-bs-target": "#offcanvasAddTicket"
                    }
                }
            ],
            initComplete: function () {
                // Adding status filter once table initialized
                this.api()
                    .columns(5)
                    .every(function () {
                        var column = this;
                        var select = $(
                            '<select id="TicketStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
                        )
                            .appendTo(".ticket_status")
                            .on("change", function () {
                                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                                column.search(val ? "^" + val + "$" : "", true, false).draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + "</option>");
                            });
                    });
                // Adding priority filter once table initialized
                this.api()
                    .columns(4)
                    .every(function () {
                        var column = this;
                        var select = $(
                            '<select id="TicketPriority" class="form-select text-capitalize"><option value=""> Select Priority </option></select>'
                        )
                            .appendTo(".ticket_priority")
                            .on("change", function () {
                                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                                column.search(val ? "^" + val + "$" : "", true, false).draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + "</option>");
                            });
                    });
            }
        });
    }

    // Delete Record
    $(".datatables-tickets tbody").on("click", ".delete-record", function () {
        dt_ticket.row($(this).parents("tr")).remove().draw();
    });
});
