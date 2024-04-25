/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
;(function ($, ns) {
    "use strict";

    var $button, $pathField, dialog;

    ns.ready(function() {

        /**
         * Listen to click of "Fix link" button
         */
        $(document).on("click", ".borrowed-content-reference--fixlink", function () {
            $button = $(this);

            var $dialog = $(".cq-sites-references-fixlink-dialog");
            if ($dialog.length === 0) return;

            $pathField = $dialog.find("foundation-autocomplete");
            $pathField.val($button.data("attribute-value"));

            dialog = $dialog[0];
            dialog.show();
        });

        /**
         * Listen to click of submit button in dialog
         */
        $(document).on("click", ".cq-sites-references-fixlink-dialog-submit", function () {
            var data = {};

            data['./' + $button.data("attributeName")] = $pathField.val();

            $.ajax({
                url: $button.data("path"),
                type: "POST",
                dataType: "JSON",
                data: data,
                success: function () {
                    $(window).adaptTo("foundation-ui").notify("", Granite.I18n.get("Reference has been updated."), "success");
                },
                error: function () {
                    $(window).adaptTo("foundation-ui").notify("", Granite.I18n.get("Reference could not be updated."), "error");
                },
                complete: function () {
                    dialog.hide();
                    ns.refreshDetail();
                }
            });
        });

        ns.shortenedLinks.registerType("borrowedContent");

    });

}(jQuery, Granite.References));
