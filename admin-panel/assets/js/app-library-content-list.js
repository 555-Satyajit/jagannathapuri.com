/**
 * App Library Content List
 */

'use strict';

// Datatable (jquery)
$(function () {
  var dt_content_list_table = $('.library-content-list-table');

  // Library Content List DataTable
  if (dt_content_list_table.length) {
    var dt_content = dt_content_list_table.DataTable({
      processing: true, // Enable the loader
      ajax: {
        url: '/admin/library/content/data',
        data: function (d) {
          d.categoryId = $('#filter-category').val();
          return d;
        }
      },
      columns: [
        // columns according to JSON
        { data: '' },
        { data: 'id' },
        { data: 'image' },
        { data: 'title' },
        { data: 'category' },
        { data: 'tags' },
        { data: 'author' },
        { data: 'status' },
        { data: '' }
      ],
      columnDefs: [
        {
          // For Responsive
          className: 'control',
          searchable: false,
          orderable: false,
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
          checkboxes: {
            selectAllRender: '<input type="checkbox" class="form-check-input">'
          },
          render: function () {
            return '<input type="checkbox" class="dt-checkboxes form-check-input">';
          }
        },
        {
          // Banner
          targets: 2,
          render: function (data, type, full, meta) {
            var $image = full['image'];
            if ($image) {
              return '<img src="/uploads/' + $image + '" alt="Banner" class="rounded" style="width: 60px; height: 35px; object-fit: cover;">';
            } else {
              return '<span class="badge bg-label-secondary">No Banner</span>';
            }
          }
        },
        {
          // Title
          targets: 3,
          render: function (data, type, full, meta) {
            var $title = full['title'];
            var $slug = full['slug'];
            return (
              '<div class="d-flex flex-column">' +
              '<strong>' + $title + '</strong>' +
              '<small class="text-muted">Slug: ' + $slug + '</small>' +
              '</div>'
            );
          }
        },
        {
          // Category
          targets: 4,
          render: function (data, type, full, meta) {
            var $category = full['category'] ? full['category'].name : 'N/A';
            return '<span class="badge bg-label-info">' + $category + '</span>';
          }
        },
        {
          // Tags
          targets: 5,
          render: function (data, type, full, meta) {
            var $tags = full['tags'] || [];
            var $output = '<div class="d-flex flex-wrap gap-1" style="max-width: 150px;">';
            $tags.forEach(function (tag) {
              $output += '<span class="badge bg-label-primary badge-xs">' + tag.name + '</span>';
            });
            $output += '</div>';
            return $output;
          }
        },
        {
          // Author
          targets: 6,
          render: function (data, type, full, meta) {
            return full['author'] || 'N/A';
          }
        },
        {
          // Status
          targets: 7,
          render: function (data, type, full, meta) {
            var $status = full['status'];
            return '<span class="badge bg-label-' + ($status === 'Active' ? 'success' : 'warning') + '">' + $status + '</span>';
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
              '<div class="d-inline-block text-nowrap">' +
              '<a href="/admin/library/content/edit/' + full['id'] + '" class="btn btn-sm btn-icon">' +
              '<i class="bx bx-edit text-primary"></i>' +
              '</a>' +
              '<button class="btn btn-sm btn-icon delete-content" data-id="' + full['id'] + '">' +
              '<i class="bx bx-trash text-danger"></i>' +
              '</button>' +
              '</div>'
            );
          }
        }
      ],
      order: [3, 'asc'], // Order by title
      dom:
        '<"card-header d-flex flex-column flex-md-row align-items-md-center justify-content-between"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>>' +
        '<"row mx-2"<"col-sm-12 col-md-6 d-flex align-items-center justify-content-start"l<"category-filter ms-3">><"col-sm-12 col-md-6"f>>' +
        't' +
        '<"row mx-2"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 10,
      lengthMenu: [10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add New Content</span>',
          className: 'add-new btn btn-primary ms-2',
          action: function (e, dt, node, config) {
            window.location.href = '/admin/library/content/add';
          }
        }
      ],
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
              return col.title !== '' // Do not show for blink columns
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

            return data ? $('<table class="table"/><tbody/>').append(data) : false;
          }
        }
      }
    });
    $('div.head-label').html('<h5 class="card-title mb-0">Library Content Entries</h5>');

    // Get categories for filter
    var categories = JSON.parse($('#categories-data').text() || '[]');
    var filterHtml = `
      <div class="d-inline-block" style="width: 200px;">
        <select id="filter-category" class="form-select text-capitalize select2">
          <option value="">All Categories</option>
          ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
        </select>
      </div>
    `;

    // Inject filter to the new dedicated area
    $('.category-filter').html(filterHtml);

    // Initialize Select2 for the dynamic filter
    $('#filter-category').select2({
      placeholder: 'Filter by Category',
      dropdownParent: $('.category-filter')
    }).on('change', function () {
      dt_content.ajax.reload();
    });

    // Handle Processing (Loader)
    dt_content_list_table.on('processing.dt', function (e, settings, processing) {
      var card = $('.library-content-list-table').closest('.card');
      if (processing) {
        card.block({
          message: '<div class="spinner-border text-primary" role="status"></div>',
          css: {
            backgroundColor: 'transparent',
            border: '0'
          },
          overlayCSS: {
            backgroundColor: '#fff',
            opacity: 0.8
          }
        });
      } else {
        card.unblock();
      }
    });
  }

  // Delete Record
  $('.library-content-list-table tbody').on('click', '.delete-content', function () {
    var contentId = $(this).data('id');
    Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this content entry?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        fetch(`/admin/library/content/delete/${contentId}`, { method: 'DELETE' })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Content has been deleted.',
                customClass: {
                  confirmButton: 'btn btn-success'
                }
              }).then(() => {
                dt_content.ajax.reload();
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error || 'Failed to delete content',
                confirmButtonClass: 'btn btn-primary',
                buttonsStyling: false
              });
            }
          });
      }
    });
  });
});
