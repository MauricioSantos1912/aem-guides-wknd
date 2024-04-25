(function (Granite) {
    'use strict';

    var FORM_SELECTOR = 'cq-common-createfolderform';
    var TITLE_FIELD_NAME = './jcr:title';
    var NAME_FIELD_NAME = ':name';
    var NAME_FIELD_SELECTOR = '#' + FORM_SELECTOR + ' input[name=\':name\']';
    var NON_VALID_CHARS = '%/\\:*?\"[]|\n\t\r. #{}^;+';
    var replacementChar = '-';
    var _ALLOWED_FILENAME_CHARS = /^[a-zA-Z0-9_\-,]+$/
    var alert;

    /**
     * Checks if the given name is valid or not.
     * The name is checked for not having any characters preset in the set of NON_VALID_CHARS.
     * If the name contains any character from the list of non valid characters,
     * then it is reported as an invalid name, otherwise as a valid name.
     * @param name the name to be checked for validity
     * @returns {boolean} true if the name is  valid, false otherwise
     */
    function isValid(name) {
        for (var i = 0; i < name.length; i++) {
            if (NON_VALID_CHARS.indexOf(name[i]) >= 0
                || name.charCodeAt(i) > 127) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a valid name formed from the given text string.
     * The given text string is checked for validity using the isValid() function.
     * If it is found to be valid, then it as returned as is, otherwise
     * all invalid characters present in the text string are replaced by the
     * replacement character and the new string is returned.
     * @param text the string to be used for generating the name
     * @returns {string} a valid name string
     */
    function getValidName(text) {
        if (isValid(text)) {
            return text;
        }
        var name = '';
        for (var i = 0; i < text.length; i++) {
            if (isValid(text[i])) {
                name += text[i];
            } else {
                name += replacementChar;
            }
        }
        return name;
    }

    /**
     * Fills the name field of the form ( create dialog form) with a valid name
     * formed from the given value
     * @param value the value to be used for forming the name.
     */
    function fillNameField(value) {
        var nameField = document.querySelector(NAME_FIELD_SELECTOR);
        nameField.value = getValidName(value);
    }

    /**
     * Conditionally displays an alert warning to the user.
     * If the given value is valid name as determined by the isValid() function,
     * then nothing is done ( if the alert was already displayed it is not removed).
     * Else if the given value is an invalid name as determined by the isValid() function,
     * and currently no alert has been given to the user, then the alert is shown.
     * @param value the value to be checked for being a valid name or not.
     */
    function checkAndShowAlert(value) {
        if (!isValid(value) && !document.body.contains(alert)) {
            if (!alert) {
                alert = new Coral.Alert();
                alert.variant = 'warning';
                alert.content = new Coral.Alert.Content();
                alert.content.textContent = Granite.I18n.get("The name must use characters matching the following regular expression {0}. Invalid characters were replaced by {1}",
                    [ _ALLOWED_FILENAME_CHARS, "-" ]);
                alert.header = new Coral.Alert.Header();
            }

            var nameElementParent = document.querySelector(NAME_FIELD_SELECTOR).parentNode;
            alert.style.width = nameElementParent.getBoundingClientRect().width + "px";
            nameElementParent.appendChild(alert);
        }
    }

    document.addEventListener('input', function (event) {
        var form = document.getElementById(FORM_SELECTOR);
        if (form != null && form.contains(event.target)) {
            var name = event.target.getAttribute('name');
            if (name === TITLE_FIELD_NAME || name === NAME_FIELD_NAME) {
                var value = event.target.value;
                fillNameField(value);
                checkAndShowAlert(value);
            }
        }
    });

})(Granite);
/**
 * Lazy loading of thumbnails in the Sites Admin Console Column View.
 *
 * The thumbnails are first displayed with an img tag that contains
 * as it's source the SVG interpretation of the
 * Spectrum-Icon-18-WebPage icon, together with a 'data-thumbnail-url'
 * attribute with the correct thumbnail URL.
 *
 * The "granite-columnview:initial-load-complete" event is triggered
 * when the lazy loading of columns has been successfully completed.
 * After this event, we lazy load the associated thumbnails of the
 * column view items by changing the value in 'data-thumbnail-url'
 * to the src value.
 *
 * We account for 'foundation-collection-navigate' and
 * 'foundation-contentloaded' events to assure consistency when
 * lazy loading the thumbnails.
 *
 * We account for changes in the column view by adding or removing
 * items due to create, copy or move actions. This can be expressed
 * by event `coral-collection:change`, triggers whenever a collection
 * is changed either appended or deleted.
 */
(function (jquery) {
    'use strict';

    /** @type {JQueryStatic} */
    var $ = jquery;

    /**
     * Load the lazy images. Only load the images residing inside the target element, instead of searching for whole document.
     * @param {HTMLElement} targetEl target container element inside which lazy images needs to be loaded.
     */
     function loadLazyImages(targetEl) {
        if (targetEl) {
            var lazyImages = Array.from(targetEl.querySelectorAll('img.is-thumbnail-lazy-loaded'));
            lazyImages.forEach(function(lazyImage) {
                var src = lazyImage.dataset.thumbnailUrl;
                lazyImage.setAttribute("src", src);
                delete lazyImage.dataset.thumbnailUrl;
                lazyImage.classList.remove("is-thumbnail-lazy-loaded");
            });
        }
    }

    $(document).on("granite-columnview:initial-load-completed", ".foundation-collection", function (event) {
        var collectionEl = event.target;
        var collection = $(collectionEl);

        // add listeners after initial load.
        collection.on("foundation-contentloaded", function(e) {
            loadLazyImages(e.target);
        });

        collection.on("foundation-collection-navigate", function(e) {
            loadLazyImages(e.target);
        });

        collection.on("coral-collection:change", function(e) {
            loadLazyImages(e.target);
        });
        loadLazyImages(collectionEl);
    });
})(Granite.$);

