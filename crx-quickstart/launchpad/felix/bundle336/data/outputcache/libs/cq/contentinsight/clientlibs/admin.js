/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2021 Adobe Systems Incorporated
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
(function (document, Granite, $) {
  "use strict";
  $(document).on("foundation-selections-change", ".foundation-collection", function (e) {
    var selectedItems = e.target.selectedItems;
    if (selectedItems && e.target.selectedItems.length === 1) {
      var selectedItem = selectedItems[0];
      var contentPath = selectedItem.dataset["foundationCollectionItemId"];
      $.getJSON(Granite.HTTP.externalize("/mnt/overlay/cq/contentinsight/content/providersettings.json" + contentPath), function (data) {
        if (data.hasActiveSetting) {
          var analyticsActivatorButton = $("coral-actionbar-item button.cq-siteadmin-admin-actions-open-content-insight-activator")
          if (analyticsActivatorButton) {
            analyticsActivatorButton.toggleClass("foundation-collection-action-hidden", !data.hasActiveSetting);
          }
        }
      });
    }
  });
})(document, Granite, Granite.$);
