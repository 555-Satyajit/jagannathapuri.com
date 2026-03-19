"use strict";

(function () {
  // Comment editor (Quill)
  const commentEditor = document.querySelector(".comment-editor");
  if (commentEditor) {
    new Quill(commentEditor, {
      modules: { toolbar: ".comment-toolbar" },
      placeholder: "Product Description",
      theme: "snow"
    });
  }

  // Ensure global array exists immediately
  if (typeof window.uploadedImages === 'undefined') {
    window.uploadedImages = [];
    console.log('app-ecommerce-product-add.js: Initialized window.uploadedImages');
  }

  // Dropzone (Media)
  if (typeof Dropzone !== 'undefined') {
    console.log('Dropzone library detected');
    console.log('Initial window.uploadedImages check:', window.uploadedImages);
    Dropzone.autoDiscover = false;
    const dropzoneBasic = document.querySelector("#dropzone-basic");
    if (dropzoneBasic) {
      console.log('Dropzone element #dropzone-basic found');
      // Safely check for existing instance
      let existingInstance;
      try {
        existingInstance = Dropzone.forElement("#dropzone-basic");
      } catch (e) {
        // No instance exists, which is fine
      }

      if (existingInstance) {
        console.log('Destroying existing Dropzone instance');
        existingInstance.destroy();
      }

      console.log('Initializing Dropzone on #dropzone-basic');
      const myDropzone = new Dropzone(dropzoneBasic, {
        url: "/admin/ecommerce/products/secure-upload",
        paramName: "file",
        maxFiles: 10,
        acceptedFiles: ".jpg,.jpeg,.png,.gif",
        addRemoveLinks: true,
        clickable: "#dropzone-basic, #btnBrowse", // Explicitly make the area and the button clickable
        previewTemplate: previewTemplate, // NEW PROPERTY
        parallelUploads: 1, // NEW PROPERTY
        maxFilesize: 5, // NEW PROPERTY
        headers: { // NEW PROPERTY
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        init: function () {
          console.log('Dropzone initialized');
          this.on("addedfile", function (file) {
            console.log("File added to dropzone:", file.name);
          });
          // Removed original "sending" handler as it's not in the new snippet
          this.on("success", function (file, response) {
            console.log("--- DROPZONE SUCCESS ---");
            console.log("Raw Response:", response);

            let res = response;
            if (typeof response === 'string') {
              try {
                res = JSON.parse(response);
              } catch (e) {
                console.error("Critical: Failed to parse server response as JSON:", response);
              }
            }

            if (res && res.success && res.filenames && res.filenames.length > 0) {
              const filename = res.filenames[0];
              file.uploadedFilename = filename; // Store for removal

              if (!window.uploadedImages) window.uploadedImages = [];
              window.uploadedImages.push(filename);

              console.log("Success! Filename captured:", filename);
              console.log("Current uploadedImages state:", window.uploadedImages);
            } else {
              console.error("Upload Error: Server response was not as expected.", res);
            }
          });
          this.on("removedfile", function (file) {
            console.log("File removed from dropzone:", file.uploadedFilename);
            if (file.uploadedFilename && window.uploadedImages) {
              const index = window.uploadedImages.indexOf(file.uploadedFilename);
              if (index > -1) {
                window.uploadedImages.splice(index, 1);
                console.log("Updated uploadedImages after removal:", window.uploadedImages);
              }
            }
          });
        }
      });
    } else {
      console.warn('Dropzone element #dropzone-basic NOT found on this page');
    }
  } else {
    console.error('Dropzone library NOT detected');
  }

  // Tagify
  const tagifyInput = document.querySelector("#ecommerce-product-tags");
  if (tagifyInput) {
    new Tagify(tagifyInput);
  }

  // Flatpickr
  const productDate = document.querySelector(".product-date");
  if (productDate) {
    productDate.flatpickr({
      monthSelectorType: "static",
      defaultDate: new Date()
    });
  }
})();

$(function () {
  // Select2 initialization
  const selects = $(".select2");
  if (selects.length) {
    selects.each(function () {
      const $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        dropdownParent: $this.parent(),
        placeholder: $this.data("placeholder")
      });
    });
  }

  // Form Repeater (Specifications)
  const formRepeater = $(".form-repeater");
  if (formRepeater.length) {
    let rowId = 2;
    let colId = 1;

    formRepeater.on("submit", function (e) {
      e.preventDefault();
    });

    formRepeater.repeater({
      show: function () {
        const $this = $(this);
        const inputs = $this.find(".form-control, .form-select");
        const labels = $this.find(".form-label");

        inputs.each(function (index) {
          const id = "form-repeater-" + rowId + "-" + colId;
          $(inputs[index]).attr("id", id);
          $(labels[index]).attr("for", id);
          colId++;
        });

        rowId++;
        $this.slideDown();

        // Re-initialize Select2 if any inside the repeater
        $this.find(".select2-container").remove();
        $this.find(".select2.form-select").select2({
          placeholder: "Select option"
        });
      },
      hide: function (deleteElement) {
        if (confirm("Are you sure you want to delete this attribute?")) {
          $(this).slideUp(deleteElement);
        }
      }
    });
  }
});