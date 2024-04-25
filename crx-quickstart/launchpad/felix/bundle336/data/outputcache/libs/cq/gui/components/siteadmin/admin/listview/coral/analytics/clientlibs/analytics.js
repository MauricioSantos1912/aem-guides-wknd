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
(function(document, Granite, $) {
  "use strict";

  var timeframeSelectSelector = ".cq-siteadmin-admin-analytics-timeframe";
  var rels = ['.cq-siteadmin-admin-createcsvexport', '.cq-siteadmin-admin-configurecolumns'];
  var analyticsCookieName = "analytics-data-timeframe";

  function onTimeframeSelectChange(value) {
    $.cookie("analytics-data-timeframe", value, { expires: 7, path: "/" });

    var collectionApi = $(".foundation-collection").adaptTo("foundation-collection");

    if (collectionApi) {
      collectionApi.reload();
    } else {
      window.location.reload();
    }
  }

  // reads the cookie, sets the selection and handles change event
  $(document).on("foundation-contentloaded", function(e) {
    var $selects = $(timeframeSelectSelector);

    $selects.each(function(index) {
      var select = $(timeframeSelectSelector).get(0);

      Coral.commons.ready(select, function() {
        if (select && select.items) {
          var items = select.items.getAll();

          var cookieValue = $.cookie(analyticsCookieName);

          for (var i = 0; i < items.length; i++) {
            if (items[i].value === cookieValue) {
              items[i].selected = true;
              break;
            }
          }

          $(select).off('change').on('change', function() {
            onTimeframeSelectChange(select.value);
          });
        }
      });
    });
  });

    // handles hide/show of the select widget on layout perform
    $(document).on("foundation-layout-perform", ".foundation-collection", function (e) {
        var $el = $(e.target);
        var config = $el.data("foundationLayout");

        var collectionId = e.target.dataset.foundationCollectionId;
        var $timeframeSelect = $(timeframeSelectSelector);
        if ($timeframeSelect.length) {
            if (collectionId && config.layoutId === "list") {
                $.get(collectionId + ".has-analytics.json", function (data) {
                    if (data.hasAnalyticsConfig) {
                        $timeframeSelect[0].hidden = false;
                        $timeframeSelect.removeClass("foundation-collection-action-hidden");
                    } else {
                        $timeframeSelect[0].hidden = true;
                    }
                });
            }
            else {
                $timeframeSelect[0].hidden = true;
            }
        }

        $(document).one("foundation-selections-change", ".foundation-collection", function (e) {
            rels.forEach(function (element, index, array) {
                if ($(element).length > 0) {
                    if (config.layoutId === "list") {
                        $(element).removeAttr("hidden");
                    } else {
                        $(element).attr("hidden", "hidden");
                    }
                }
            });
        });
    });

})(document, Granite, Granite.$);