/**
 * App Library Category List
 */

'use strict';

// Datatable (jquery)
$(function () {
  var dt_category_list_table = $('.library-category-list-table');

  // Library Category List DataTable
  if (dt_category_list_table.length) {
    var dt_category = dt_category_list_table.DataTable({
      ajax: '/admin/library/categories/data', // Use the new data endpoint
      columns: [
        // columns according to JSON
        { data: '' },
        { data: 'id' },
        { data: 'image' },
        { data: 'name' },
        { data: 'slug' },
        { data: 'contents' },
        { data: 'show_on_home' },
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
          // Image
          targets: 2,
          render: function (data, type, full, meta) {
            var $image = full['image'];
            if ($image) {
              return '<img src="/uploads/' + $image + '" alt="Cat" class="rounded" style="width: 40px; height: 40px; object-fit: cover;">';
            } else {
              return '<span class="badge bg-label-secondary">No Img</span>';
            }
          }
        },
        {
          // Name
          targets: 3,
          render: function (data, type, full, meta) {
            var $name = full['name'];
            return '<strong>' + $name + '</strong>';
          }
        },
        {
          // Slug
          targets: 4,
          render: function (data, type, full, meta) {
            var $slug = full['slug'];
            return '<code>' + $slug + '</code>';
          }
        },
        {
          // Contents
          targets: 5,
          render: function (data, type, full, meta) {
            var $count = full['_count'] ? full['_count'].contents : 0;
            return '<span class="badge bg-label-info">' + $count + ' Items</span>';
          }
        },
        {
          // Home
          targets: 6,
          render: function (data, type, full, meta) {
            var $show = full['show_on_home'];
            return '<span class="badge bg-label-' + ($show ? 'primary' : 'secondary') + '">' + ($show ? 'Yes' : 'No') + '</span>';
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
              '<button class="btn btn-sm btn-icon edit-cat" ' +
              'data-id="' + full['id'] + '" ' +
              'data-name="' + full['name'] + '" ' +
              'data-desc="' + (full['description'] || '') + '" ' +
              'data-status="' + full['status'] + '" ' +
              'data-home="' + full['show_on_home'] + '" ' +
              'data-meta-title="' + (full['meta_title'] || '') + '" ' +
              'data-meta-desc="' + (full['meta_description'] || '') + '" ' +
              'data-meta-keys="' + (full['meta_keywords'] || '') + '">' +
              '<i class="bx bx-edit text-primary"></i>' +
              '</button>' +
              '<button class="btn btn-sm btn-icon delete-cat" data-id="' + full['id'] + '">' +
              '<i class="bx bx-trash text-danger"></i>' +
              '</button>' +
              '</div>'
            );
          }
        }
      ],
      order: [3, 'asc'], // Order by name
      dom:
        '<"card-header d-flex flex-column flex-md-row align-items-md-center justify-content-between"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
      displayLength: 7,
      lengthMenu: [7, 10, 25, 50, 75, 100],
      buttons: [
        {
          text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Add Category</span>',
          className: 'add-new btn btn-primary ms-2',
          attr: {
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#offcanvasCategory'
          }
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + data['name'];
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
    $('div.head-label').html('<h5 class="card-title mb-0">Library Categories</h5>');
  }

  // Delete Record
  $('.library-category-list-table tbody').on('click', '.delete-cat', function () {
    var catId = $(this).data('id');
    Swal.fire({
      title: 'Are you sure?',
      text: "This will fail if category has contents.",
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
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        fetch(`/admin/library/categories/delete/${catId}`, {
          method: 'DELETE',
          headers: {
            'X-CSRF-TOKEN': csrfToken
          }
        })
          .then(res => {
            if (!res.ok) {
              return res.text().then(text => {
                throw new Error(text || `Server returned ${res.status}`);
              });
            }
            return res.json();
          })
          .then(data => {
            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Category has been deleted.',
                customClass: {
                  confirmButton: 'btn btn-success'
                }
              }).then(() => {
                dt_category.ajax.reload();
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: data.error || 'Failed to delete category',
                icon: 'error',
                customClass: {
                  confirmButton: 'btn btn-primary'
                }
              });
            }
          })
          .catch(err => {
            console.error('Delete error:', err);
            Swal.fire({
              title: 'Error',
              text: err.message || 'An error occurred while deleting.',
              icon: 'error',
              customClass: {
                confirmButton: 'btn btn-primary'
              }
            });
          });
      }
    });
  });

  // Edit Record
  $('.library-category-list-table tbody').on('click', '.edit-cat', function () {
    var $this = $(this);
    $('#cat-id').val($this.data('id'));
    $('#cat-name').val($this.data('name'));
    $('#cat-desc').val($this.data('desc'));
    $('#cat-status').val($this.data('status'));
    $('#cat-home').prop('checked', $this.data('home') === true || $this.data('home') === 'true');

    // SEO Fields
    $('#meta_title').val($this.data('meta-title') || '');
    $('#meta_description').val($this.data('meta-desc') || '');
    $('#meta_keywords').val($this.data('meta-keys') || '');

    // Initialize SEO meters if needed
    if (typeof updateSeoMeter === 'function') {
      updateSeoMeter(document.getElementById('meta_title'), 100, 30, 60);
      updateSeoMeter(document.getElementById('meta_description'), 300, 120, 160);
    }

    var offcanvasElement = document.getElementById('offcanvasCategory');
    var offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement) || new bootstrap.Offcanvas(offcanvasElement);
    offcanvas.show();
  });
});
