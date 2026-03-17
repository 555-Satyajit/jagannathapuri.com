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

    const dt_logs_table = $(".datatables-audit-logs");
    const filter_date_range = $("#FilterDateRange");

    let startDate = "", endDate = "";

    if (filter_date_range.length) {
        filter_date_range.flatpickr({
            mode: "range",
            dateFormat: "Y-m-d",
            onClose: function (selectedDates, dateStr, instance) {
                if (selectedDates.length === 2) {
                    startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
                    endDate = moment(selectedDates[1]).format("YYYY-MM-DD");
                } else if (selectedDates.length === 0) {
                    startDate = "";
                    endDate = "";
                }
                
                // Safe reload
                if ($.fn.DataTable.isDataTable(".datatables-audit-logs")) {
                    $(".datatables-audit-logs").DataTable().ajax.reload();
                }
            }
        });
    }

    if (dt_logs_table.length) {
        const dt_logs = dt_logs_table.DataTable({
            processing: true,
            ajax: {
                url: "/admin/settings/audit-logs/data",
                data: function (d) {
                    d.adminId = $("#FilterAdmin").val();
                    d.action = $("#FilterAction").val();
                    d.entity = $("#FilterEntity").val();
                    d.ipAddress = $("#FilterIP").val();
                    d.startDate = startDate;
                    d.endDate = endDate;
                }
            },
            columns: [
                { data: "createdAt" },
                { data: "admin" },
                { data: "action" },
                { data: "entity" },
                { data: "details" },
                { data: "ipAddress" }
            ],
            columnDefs: [
                {
                    // Date and Time
                    targets: 0,
                    render: function (data) {
                        return '<span class="local-date" data-utc="' + data + '">' + new Date(data).toLocaleString() + '</span>';
                    }
                },
                {
                    // Admin
                    targets: 1,
                    render: function (data, type, full) {
                        const name = data ? data.full_name : "Unknown";
                        const username = data ? data.username : "unknown";
                        const avatar = data && data.avatar ? "/uploads/staff/" + data.avatar : "/admin-assets/img/avatars/1.png";
                        
                        return (
                            '<div class="d-flex justify-content-start align-items-center">' +
                            '<div class="avatar-wrapper"><div class="avatar me-2"><img src="' + avatar + '" alt="Avatar" class="rounded-circle"></div></div>' +
                            '<div class="d-flex flex-column"><span class="text-body text-truncate fw-semibold">' + name + '</span>' +
                            '<small class="text-muted">@' + username + '</small></div>' +
                            '</div>'
                        );
                    }
                },
                {
                    // Action
                    targets: 2,
                    render: function (data) {
                        return '<span class="badge bg-label-primary">' + data + '</span>';
                    }
                },
                {
                    // Entity
                    targets: 3,
                    render: function (data, type, full) {
                        if (!data) return "-";
                        let html = '<span class="fw-bold">' + data + '</span>';
                        if (full.entityId) {
                            html += ' <small class="text-muted">(#' + full.entityId + ')</small>';
                        }
                        return html;
                    }
                },
                {
                    // Details
                    targets: 4,
                    render: function (data) {
                        if (!data) return "-";
                        const display = data.length > 50 ? data.substring(0, 50) + "..." : data;
                        return '<span title="' + data + '">' + display + '</span>';
                    }
                },
                {
                    // IP Address
                    targets: 5,
                    render: function (data) {
                        return '<small>' + (data || "Unknown") + '</small>';
                    }
                }
            ],
            order: [[0, "desc"]],
            dom: '<"card-header d-flex border-top rounded-0 flex-wrap py-md-0"<"me-5 ms-n2 pe-5"f><"d-flex justify-content-start justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex align-items-start align-items-md-center justify-content-sm-center mb-3 mb-sm-0"lB>>>t<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
            lengthMenu: [10, 20, 50, 70, 100],
            language: {
                sLengthMenu: "_MENU_",
                search: "",
                searchPlaceholder: "Search Logs",
                info: "Displaying _START_ to _END_ of _TOTAL_ entries",
            },
            buttons: [
                {
                    extend: "collection",
                    className: "btn btn-label-secondary dropdown-toggle me-3",
                    text: '<i class="bx bx-export me-1"></i>Export',
                    buttons: [
                        { extend: "print", className: "dropdown-item", text: '<i class="bx bx-printer me-2"></i>Print' },
                        { extend: "csv", className: "dropdown-item", text: '<i class="bx bx-file me-2"></i>Csv' },
                        { extend: "excel", className: "dropdown-item", text: '<i class="bx bxs-file-export me-2"></i>Excel' },
                        { extend: "pdf", className: "dropdown-item", text: '<i class="bx bxs-file-pdf me-2"></i>Pdf' },
                        { extend: "copy", className: "dropdown-item", text: '<i class="bx bx-copy me-2"></i>Copy' }
                    ]
                }
            ],
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            const data = row.data();
                            return "Activity Details - " + data.action;
                        }
                    }),
                    type: "column",
                    renderer: function (api, rowIdx, columns) {
                        const data = $.map(columns, function (col, i) {
                            return col.title !== ""
                                ? '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '"><td>' + col.title + ":</td><td>" + col.data + "</td></tr>"
                                : "";
                        }).join("");
                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                }
            }
        });

        // Filter event listeners
        $("#FilterAdmin, #FilterAction, #FilterEntity, #FilterIP").on("change keyup", function () {
            dt_logs.ajax.reload();
        });

        // Reset Filter Functionality
        $("#btnResetFilters").on("click", function () {
            // Reset Select2 fields
            $("#FilterAdmin, #FilterAction, #FilterEntity").val("").trigger("change");
            
            // Reset IP field
            $("#FilterIP").val("");
            
            // Reset flatpickr
            if (filter_date_range.length) {
                filter_date_range[0]._flatpickr.clear();
            }
            startDate = "";
            endDate = "";
            
            // Reload table
            dt_logs.ajax.reload();
        });

        // Initialize Select2
        if ($(".form-select").length) {
            $(".form-select").each(function () {
                var $this = $(this);
                $this.wrap('<div class="position-relative"></div>').select2({
                    placeholder: "Select Option",
                    dropdownParent: $this.parent(),
                    allowClear: true
                });
            });
        }

        // Clean up utility
        setTimeout(() => {
            $(".dataTables_filter .form-control").removeClass("form-control-sm");
            $(".dataTables_length .form-select").removeClass("form-select-sm");
        }, 300);
    }
});
