"use strict";

$(function () {
    var dt_transaction_table = $('.transaction-list-table');

    if (dt_transaction_table.length) {
        var dt_transaction = dt_transaction_table.DataTable({
            ajax: '/admin/ecommerce/transactions/data',
            columns: [
                { data: '' },
                { data: 'transaction_id' },
                { data: 'customer_name' },
                { data: 'amount' },
                { data: 'date' },
                { data: 'payment_method' },
                { data: 'status' },
                { data: '' }
            ],
            columnDefs: [
                {
                    className: 'control',
                    responsivePriority: 2,
                    searchable: false,
                    orderable: false,
                    targets: 0,
                    render: function (data, type, full, meta) {
                        return '';
                    }
                },
                {
                    targets: 1,
                    render: function (data, type, full, meta) {
                        return '<span class="fw-medium text-body">#' + full['transaction_id'] + '</span>';
                    }
                },
                {
                    targets: 2,
                    render: function (data, type, full, meta) {
                        var $name = full['customer_name'],
                            $email = full['customer_email'],
                            $image = '';

                        var $initials = $name.match(/\b\w/g) || [];
                        $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
                        var $output = '<span class="avatar-initial rounded-circle bg-label-' + ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'][Math.floor(Math.random() * 6)] + '">' + $initials + '</span>';

                        return '<div class="d-flex justify-content-start align-items-center customer-name">' +
                            '<div class="avatar-wrapper">' +
                            '<div class="avatar avatar-sm me-2">' + $output + '</div>' +
                            '</div>' +
                            '<div class="d-flex flex-column">' +
                            '<a href="/admin/ecommerce/customers/details/' + full['customer_id'] + '" class="text-body text-truncate fw-medium">' + $name + '</a>' +
                            '<small class="text-muted">' + $email + '</small>' +
                            '</div>' +
                            '</div>';
                    }
                },
                {
                    targets: 3,
                    render: function (data, type, full, meta) {
                        return '<span class="fw-medium text-body">₹' + full['amount'].toFixed(2) + '</span>';
                    }
                },
                {
                    targets: 4,
                    render: function (data, type, full, meta) {
                        var date = new Date(full['date']);
                        return '<span class="text-body">' + moment(date).format('DD MMM YYYY, HH:mm') + '</span>';
                    }
                },
                {
                    targets: 5,
                    render: function (data, type, full, meta) {
                        var $method = full['payment_method'],
                            $last4 = full['payment_last4'];
                        var $icon = '';
                        if ($method === 'Mastercard') $icon = '<i class="bx bxl-mastercard text-danger me-1"></i>';
                        else if ($method === 'Visa') $icon = '<i class="bx bxl-visa text-primary me-1"></i>';
                        else if ($method === 'PayPal') $icon = '<i class="bx bxl-paypal text-info me-1"></i>';

                        return '<div class="d-flex align-items-center">' + $icon + '<span>' + $method + ($last4 ? ' (*' + $last4 + ')' : '') + '</span></div>';
                    }
                },
                {
                    targets: 6,
                    render: function (data, type, full, meta) {
                        var $status = full['status'];
                        var roleBadgeObj = {
                            'Paid': '<span class="badge bg-label-success">Paid</span>',
                            'Pending': '<span class="badge bg-label-warning">Pending</span>',
                            'Failed': '<span class="badge bg-label-danger">Failed</span>'
                        };
                        return roleBadgeObj[$status] || $status;
                    }
                },
                {
                    targets: -1,
                    title: 'Actions',
                    searchable: false,
                    orderable: false,
                    render: function (data, type, full, meta) {
                        return (
                            '<div class="d-inline-block text-nowrap">' +
                            '<button class="btn btn-sm btn-icon"><i class="bx bx-show"></i></button>' +
                            '<button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="bx bx-dots-vertical-rounded"></i></button>' +
                            '<div class="dropdown-menu dropdown-menu-end m-0">' +
                            '<a href="javascript:;" class="dropdown-item">Download Receipt</a>' +
                            '<a href="javascript:;" class="dropdown-item">Refund</a>' +
                            '</div>' +
                            '</div>'
                        );
                    }
                }
            ],
            order: [[4, 'desc']],
            dom:
                '<"row mx-1"' +
                '<"col-12 col-md-6 d-flex align-items-center justify-content-center justify-content-md-start gap-3"l<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start mt-md-0 mt-3">> ' +
                '<"col-12 col-md-6 d-flex align-items-center justify-content-end flex-column flex-md-row pe-3 gap-md-3"f<"transaction_status mb-3 mb-md-0">>' +
                '>t' +
                '<"row mx-2"' +
                '<"col-sm-12 col-md-6"i>' +
                '<"col-sm-12 col-md-6"p>' +
                '>',
            language: {
                sLengthMenu: '_MENU_',
                search: '',
                searchPlaceholder: 'Search Transaction'
            },
            responsive: {
                details: {
                    display: $.fn.dataTable.Responsive.display.modal({
                        header: function (row) {
                            var data = row.data();
                            return 'Details of #' + data['transaction_id'];
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
                                '<td>' +
                                col.title +
                                ':' +
                                '</td> ' +
                                '<td>' +
                                col.data +
                                '</td>' +
                                '</tr>'
                                : '';
                        }).join('');

                        return data ? $('<table class="table"/><tbody />').append(data) : false;
                    }
                }
            },
            initComplete: function () {
                // Adding status filter once table initialized
                this.api()
                    .columns(6)
                    .every(function () {
                        var column = this;
                        var select = $(
                            '<select id="TransactionStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
                        )
                            .appendTo('.transaction_status')
                            .on('change', function () {
                                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                                column.search(val ? '^' + val + '$' : '', true, false).draw();
                            });

                        column
                            .data()
                            .unique()
                            .sort()
                            .each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>');
                            });
                    });
            }
        });
    }

    // Filter form control to default size
    // ? To use Bootstrap default cell for search
    setTimeout(() => {
        $('.dataTables_filter .form-control').removeClass('form-control-sm');
        $('.dataTables_length .form-select').removeClass('form-select-sm');
    }, 300);
});
