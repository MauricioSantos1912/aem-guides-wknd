/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2022 Adobe Systems Incorporated
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
(function($, Granite) {
    "use strict";

    $(document).ready(function() {
        $("[onTime]").each(function() {
            var onTime = $(this).attr("onTime");
            var offTime = $(this).attr("offTime");
            var format = Granite.I18n.get("MMMM DD, YYYY hh:mm a");
            var title = "";

            if (onTime > 0) {
                title += Granite.I18n.get("On Time") + ": ";
                title += moment(new Date(+onTime)).format(format);
            }
            if (offTime > 0) {
                title += (title.length > 0) ? "\n" : "";
                title += Granite.I18n.get("Off Time") + ": ";
                title += moment(new Date(+offTime)).format(format);
            }

            if (title.length > 0) {
                $(this).attr("title", title);
            }
        });

        var changedElement = document.querySelector('.foundation-collection-content');

        function RoleRemover() {
            if (changedElement && !changedElement.querySelector('.foundation-layout-masonry')) {
                var coralIcons = changedElement.querySelectorAll("coral-icon");

                for (var coralIcon = 0; coralIcon < coralIcons.length; coralIcon++) {
                    coralIcons[coralIcon].removeAttribute("role");
                }
            }
        };

        //Preemptive call to fix current mode
        RoleRemover();

        //Observe if user changes mode to reapply role removal.
        var observer = new MutationObserver(RoleRemover);
        observer.observe(changedElement, {childList: true});
    });

})(Granite.$, Granite);
