
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
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
    
    var liveCopySourcePath = "";
    var $section, $dialog, dialog;
    var $rolloutScope;
    var itemType = null;

    ns.ready(function() {

        /**
         * Listen to tap/click on "Rollout" button
         */
        ns.$root.on("click", ".detail .live-copy-rollout", function () {
            $section = $(this).closest("section");

            if ($section.data("path")) {
                liveCopySourcePath = CQ.shared.XSS.getXSSValue($(this).data("path"));

                $dialog = $(".cq-sites-references-rollout-dialog");
                if ($dialog.length === 0) return;
                dialog = $dialog[0];

                dialog.header.innerHTML = Granite.I18n.get("{0} {1}", [Granite.I18n.get($dialog.data("title")), liveCopySourcePath], "i18n is used for the ordering only; {0} is 'Rollout' (already translated) and {1} the path of the page to be rolled out");
                dialog.show();
            }
        });

        /**
         * Listen to click of submit button in dialog
         */
        $(document).on("click", ".cq-sites-references-rollout-dialog-submit", function () {
            var rollout_status;
            var time = null;

            var schedultOptionNow = $(".schedule-rollout-options-now", ".schedule-rollout-options");
            var scheduleOptionLater = $(".schedule-rollout-options-later", ".schedule-rollout-options");
            var scheduleOptionDatePicker = $(".schedule-rollout-datepicker");
            if (schedultOptionNow.length && schedultOptionNow[0].checked) {
                rollout_status= schedultOptionNow[0].value;
            } else if (scheduleOptionLater.length && scheduleOptionLater[0].checked) {
                rollout_status = scheduleOptionLater[0].value;
                time = scheduleOptionDatePicker[0].value;
            }
            var data = {
                cmd: "rollout",
                _charset_: "utf-8",
                ":status": "browser",
                path: liveCopySourcePath,
                "msm:targetPath": $section.data("path"),
                type: $dialog.find("input:radio[name=rollout-type]:checked").val(),
                reportSchedule: rollout_status,
                scheduleDate:time!=null?time:null,
                operation: "asyncRollout",
                "msm:async": true
            };
            jQuery.post(Granite.HTTP.externalize("/bin/asynccommand"), data, function (response, status, r) {
                dialog.hide();
                if (status === "success") {
                    $(window).adaptTo("foundation-ui").notify("", Granite.I18n.get("Source was rolled out"), "success");
                    //refresh livecopy section
                    ns.refreshDetailSection("liveCopy");
                } else {
                    //error handling
                    $(window).adaptTo("foundation-ui").notify("", Granite.I18n.get("Failed to rollout Source"), "failure");
                }
            });
        });

    });

    }(jQuery, Granite.References));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2013 Adobe Systems Incorporated
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

    ns.ready(function() {

        /**
         * Listen to tap/click on "Edit live copy" button
         */
        ns.$root.on("click", ".detail .live-copy-edit", function () {
            var $section = $(this).closest("section");

            if ($section.data("path")) {
                var url = Granite.URITemplate.expand("/libs/wcm/core/content/sites/editlivecopywizard.html{+item}", {
                    item: $section.data("path")
                });
                location.href = Granite.HTTP.externalize(url);
            }
        });

    });

}(jQuery, Granite.References));

