/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
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

    $(document).on("foundation-contentloaded.omnisearch-results", function(e) {
        // private CSS usage/s
        var container = $("#granite-omnisearch-result-actionbar betty-titlebar-secondary");
        var csvExportButton = container.find(".csv-omnisearch-export");
        var omnisearchTags = $(".granite-omnisearch-typeahead-tags");
        var isLocationSites = omnisearchTags.length > 0 && omnisearchTags.val().indexOf(Granite.I18n.get("Sites")) > 0;

        if (csvExportButton.length === 0 && isLocationSites) {
            var button = new Coral.Button().set({
                variant: "quiet",
                icon: "report"
            });

            button.on("click", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var url = Granite.HTTP.externalize("/mnt/overlay/wcm/core/content/sites/createcsvexport.html/content?type=omnisearch");

                window.open(url, "_blank");
            });

            button.label.innerHTML = Granite.I18n.get("CSV Report");
            $(button).addClass("csv-omnisearch-export");

            var actionbarItem = $("<div class='granite-actionbar-item'></div>");
            actionbarItem.append(button);

            container.prepend(actionbarItem);

            sessionStorage.setItem("omnisearch-csv-report.search-params", $(".granite-omnisearch-form").serialize());
        }
    });
})(Granite.$, Granite);
