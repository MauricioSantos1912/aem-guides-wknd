/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
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

  var viewSettingsConfigs = {}; // the 'View Settings' action elements
  var configureColumnsDefaultDialogURITemplate = "/mnt/overlay/wcm/core/content/coral/common/configurecolumnsdialog.html{+id}";

  function toggleViewSettingsAction(show, $collection) {
    if ($(".granite-collection-switcher-settings").length) {
      // if there is already a view settings
      return;
    }
    var foundationModeGroup = $collection.data('foundationModeGroup');
    var stateId = $collection.data("columnsStateId");
    var collectionSelector = foundationModeGroup === 'granite-omnisearch-result' ? '#granite-omnisearch-result' : "." + foundationModeGroup;

    var cycleButton = $("[data-granite-collection-switcher-target='" + collectionSelector + "']").get(0);
    var URITemplate = $collection.data("configureColumnsDialogUriTemplate") || configureColumnsDefaultDialogURITemplate;

    if ($(".cq-damadmin-admin-childpages").length > 0) {
      URITemplate = "/mnt/overlay/dam/gui/content/commons/configurecolumnsdialog.html{+id}";
      stateId = "aem.assets.listview.columns";
    }

    if (cycleButton) {
      var viewSettingsCfg = viewSettingsConfigs[collectionSelector];
      if (show) {
        if (!viewSettingsCfg) {
          var actionText = Granite.I18n.get("View Settings");
          var actionHTML = '<coral-cyclebutton-action icon="gear" class="foundation-collection-action">' + actionText + '</coral-quickactions-item>';
          var $action = $(actionHTML);

          viewSettingsCfg = {
            "markup": $action
          };

          viewSettingsConfigs[collectionSelector] = viewSettingsCfg;
        }

          viewSettingsCfg["markup"].data("foundationCollectionAction", getActionObject(collectionSelector, URITemplate, stateId));
          viewSettingsCfg["action"] = cycleButton.actions.add(viewSettingsCfg["markup"].get(0));
          $(viewSettingsCfg["action"]).off("click.view-settings").on("click.view-settings", function(event) {
              viewSettingsCfg["markup"].data("foundationCollectionAction")["data"]["src"] += "&_cc=" + Date.now();
          });
      } else {
        if (viewSettingsCfg) {
          cycleButton.actions.remove(viewSettingsCfg["action"]);
        }
      }
    }
  }

  function getActionObject(collectionSelector, URITemplate, stateId) {
      return {
          target: collectionSelector,
          action: "foundation.dialog",
          data: {
              src: URITemplate + "?stateId="+(stateId ? stateId : "aem.sites.listview.columns")
          },
          relScope: "none"
      };
  }

  function toggleOmnisearchExportToCSV(show) {
    var omnisearchCollectionToggle = $("[data-granite-collection-switcher-target='#granite-omnisearch-result']");
    if (omnisearchCollectionToggle.length <= 0) {
      return;
    }

    var omnisearchParams = $(".granite-omnisearch-form").serialize();

    sessionStorage.setItem("omnisearch-csv-report.search-params", omnisearchParams);

    var omnisearchCsvReportMarkup = '<a id="omnisearch-csv-report" class="foundation-collection-action" is="coral-anchorbutton" variant="quiet" icon="report" iconsize="S" ' +
        'data-foundation-collection-action="{&quot;target&quot;:&quot;.cq-siteadmin-admin-childpages&quot;,&quot;action&quot;:&quot;foundation.link&quot;,&quot;data&quot;:{&quot;href&quot;:&quot;/mnt/overlay/wcm/core/content/sites/createcsvexport.html{+id}?type=omnisearch&quot;,&quot;target&quot;:&quot;_blank&quot;},&quot;relScope&quot;:&quot;none&quot;}">CSV Report</a>';
    var omnisearchButton = $("#omnisearch-csv-report");

    if (omnisearchButton.length <= 0) {
      $(".granite-omnisearch-overlay .granite-actionbar-right").prepend(omnisearchCsvReportMarkup);
      omnisearchButton = $("#omnisearch-csv-report");
    }

    if (show) {
      omnisearchButton.show();
    } else {
      omnisearchButton.hide();
    }
  }

  $(document).on("foundation-layout-perform", ".foundation-collection", function(e) {
    var $collection = $(e.target);
    var config = $collection.data("foundationLayout");

    $(document).one("foundation-selections-change", ".foundation-collection", function(e) {
      var showAction = (config.layoutId === "list");
      toggleViewSettingsAction(showAction, $collection);
      toggleOmnisearchExportToCSV(showAction);
    });
  });

})(document, Granite, Granite.$);

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
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

  var ui = $(window).adaptTo("foundation-ui");

  var collectionSelector = ".foundation-collection";
  var columnsSelector = "coral-checkbox";
  var selectedColumnSelector = "coral-checkbox[checked]";
  var configureColumnsDialogSelector = ".aem-configure-columns-dialog";
  var configureColumnsFormSelector = "#aem-configure-columns";
  var configureColumnsColumnChooserSelector = ".aem-ColumnChooser";
  var configureColumnsConfirmSelector = ".aem-configure-columns-confirm";
  var removeCustomAnalyticsColumnSelector = '.aem-listview-remove-column';
  var pathConfigSelector = ".manage-columns-for-path-container";
  var pathConfigSelectSelector = ".manage-columns-for-path-select";
  var hasAnalyticsConfigSelector = "[name='hasAnalyticsConfig']";
  var addCustomAnalyticsColumnsSelector = ".aem-add-custom-analytics-data-container";

  var columnsQuota = 0; // max number of columns that fit to the available space
  var totalSelectableColumns = 0; // the number of columns potentially selectable
  var initialSelection = [];
  var isSetup = false;

  function reloadContent() {
    var isSearchResult = $("#granite-omnisearch-result").size() > 0;
    var searchForm = $(".granite-omnisearch-form");

    if (isSearchResult) {
      // re-submits the search form, and by doing so content is updated
      searchForm.submit();
      if ($(configureColumnsDialogSelector).length > 0) {
          $(configureColumnsDialogSelector)[0].open = false;
      }
    } else {
      window.location.reload();
    }
  }

  function updateCookieFromSelected() {
    var configureColumnsForm = $(configureColumnsFormSelector);
    var $selectedColumns = configureColumnsForm.find(selectedColumnSelector);
    var $columnChooser = $(configureColumnsColumnChooserSelector);
    var cookieConfig = $columnChooser.data("columnsCookie");
    var cookieValue = "";

    if (!cookieConfig) {
      return;
    }

    for (var i = 0; i < $selectedColumns.length; i++) {
      cookieValue += $($selectedColumns[i]).val() + ",";
    }

    $.cookie(cookieConfig.name, cookieValue, cookieConfig);
  }

  function updateCookieAndReload() {
    updateCookieFromSelected();
    reloadContent();
  }

  function isTableLayout() {
    var $collection = getCurrentCollectionOfInterest();
    return ($collection && $collection.length > 0 && $collection.first().hasClass("foundation-layout-table"));
  }

  function getSelection(containerElementOrSelector) {
    var container = containerElementOrSelector || configureColumnsFormSelector;
    var selection = [];
    var $items = $(container).find(selectedColumnSelector);

    for (var i = 0 ; i < $items.length; i++) {
      selection.push($($items[i]).val());
    }

    return selection;
  }

  function updateDialogTitle(totalSelected, maximum) {
    var totalSelector = "span";
    var $title = $(configureColumnsDialogSelector + " coral-dialog-header");
    var $total = $title.find(totalSelector);

    if ($total.length < 1) {
      $title.append("<span></span>");
      $total = $title.find(totalSelector);
    }

    $total.html(" (" + totalSelected + "/" + maximum + ")");
  }

  function updateCheckboxStates() {
    var totalSelected = $(configureColumnsFormSelector).find(selectedColumnSelector).length;

    $(configureColumnsFormSelector).find(columnsSelector).each(function(index, checkboxItem) {
      var $item = $(checkboxItem);
      if (totalSelected >= columnsQuota) {
        if (!$item.get(0).checked) {
          $item.attr("disabled", "disabled");
        } else {
          $item.removeAttr("disabled");
        }
      } else {
        $item.removeAttr("disabled");
      }
    });
  }

  function togglePathConfig() {
    var $configureColumnsForm = $(configureColumnsFormSelector);
    var $pathConfig = $configureColumnsForm.find(pathConfigSelector);

    if ($(pathConfigSelectSelector).length > 0) {
      Coral.commons.ready($(pathConfigSelectSelector)[0], function() {
        var $pathConfigOptions = $(pathConfigSelectSelector).find('coral-select-item');

        $pathConfig.toggle($pathConfigOptions && $pathConfigOptions.length > 1);
      });
    }
  }

  function toggleAddCustomAnalyticsColumns() {
    if (!isTableLayout()) {
      return;
    }

    var $configureColumnsForm = $(configureColumnsFormSelector);
    var $addCustomAnalyticsColumns = $configureColumnsForm.find(addCustomAnalyticsColumnsSelector);
    var hasAnalyticsConfig = $(hasAnalyticsConfigSelector).val();

    // shows add custom analytics columns button if Adobe Analytics config is available
    $addCustomAnalyticsColumns.toggle(hasAnalyticsConfig && hasAnalyticsConfig == "true");
  }

  function toggleConfirmAction(enable) {
    $(configureColumnsFormSelector).closest(configureColumnsDialogSelector).find(configureColumnsConfirmSelector)[0].disabled = !enable;
  }

  function calculateColumnsQuota() {
    var total = 0;
    var maxNumberColumns = 7;
    var minNumberColumns = 2;
    var minColumnWidth = 100; /* px */
    var numberDefaultColumns = 2; /* the select and order columns are static */

    var columnsQuotaConfig = $(configureColumnsFormSelector).data("totalColumns");
    var availableWidth = $(collectionSelector).first().width();

    if (!isNaN(columnsQuotaConfig)) {
      total = parseInt(columnsQuotaConfig);
    } else {
      total = Math.floor(availableWidth / minColumnWidth) - numberDefaultColumns;
      if (total < minNumberColumns) {
        total = minNumberColumns;
      } else if (total > maxNumberColumns) {
        total = maxNumberColumns;
      }
    }

    return total;
  }

  function resetDialog() {
    // restores the initial selection
    var $columnSelectors = $(configureColumnsFormSelector).find(columnsSelector);

    $columnSelectors.each(function(index) {
      var $current = $(this);
      var $container = $current.closest("li");

      if ($.inArray($current.val(), initialSelection) >= 0) {
        $current.prop("checked", true);
        $container.addClass("selected");
      } else {
        $current.prop("checked", false);
        $container.removeClass("selected");
      }
    });

    columnsQuota = calculateColumnsQuota();
    toggleConfirmAction(false);
    updateDialogTitle(initialSelection.length, totalSelectableColumns);
    updateCheckboxStates();
  }

  function onColumnSelected(event) {
    var $checkbox = $(event.target);
    var totalSelected = $(configureColumnsFormSelector).find(selectedColumnSelector).length;

    if (totalSelected > columnsQuota && totalSelected > initialSelection.length) {
      return false;
    }

    var currentSelection = getSelection();
    var selectionChanged = false;

    if (currentSelection.length != initialSelection.length) {
      selectionChanged = true;
    } else {
      for (var i = 0; i < currentSelection.length; i++) {
        if ($.inArray(currentSelection[i], initialSelection) < 0) {
          selectionChanged = true;
          break;
        }
      }
    }

    toggleConfirmAction(selectionChanged);

    var $item = $checkbox.closest("li");
    $item.toggleClass("selected", $checkbox.is(":checked"));

    updateCheckboxStates();
    updateDialogTitle(totalSelected, totalSelectableColumns);
  }

  function onManageColumnsForPathChange(event) {
    var select = event.target;
    var selectedContentPath = select.value;
    var $columnChooser = $(configureColumnsFormSelector).find(configureColumnsColumnChooserSelector);
    var componentPath = $columnChooser.data("component-path");

    ui.wait($columnChooser[0]);

    // updates configure columns dialog columns
    Granite.$.ajax({
      type: "GET",
      url: componentPath + ".html" + selectedContentPath,
      success: function(data, status, request) {
        ui.clearWait();
        $(configureColumnsFormSelector).find(hasAnalyticsConfigSelector).remove();
        $columnChooser.replaceWith(data);

        $(configureColumnsFormSelector + " " + columnsSelector).off("change").on("change", onColumnSelected);
        $(removeCustomAnalyticsColumnSelector).off("click").on("click", onRemoveCustomAnalyticsColumn);
        toggleConfirmAction(false);

        setup();
      },
      error: function() {
        ui.notify("", Granite.I18n.get("Error occurred while loading configured columns."), "error");
        ui.clearWait();
      }
    });
  }

  function removeCustomAnalyticsColumn(config) {
    Granite.$.ajax({
      type: "DELETE",
      url: config.configPath + '/jcr:content.customdata.config?metric=' + config.metricId + '&contentpath=' + config.contentPath,
      success: function(data, status, request) {
        ui.notify("", Granite.I18n.get('Successfully removed metric {0}.', config.metricId), "success");

        // if the item is checked, remove from cookies and do a refresh
        var $removedContainer = config.$activator.closest("li");

        if ($removedContainer.hasClass("selected")) {
          $removedContainer.remove();
          updateCookieAndReload();
        } else {
          $removedContainer.remove();
        }
      },
      error: function() {
        ui.notify("", Granite.I18n.get('Error occurred while removing custom metric {0}.', config.metricId), "error");
      }
    });
  }

  function onRemoveCustomAnalyticsColumn(event) {
    var $target = $(event.target);
    var $activator = $target.closest("a");
    var $metricsConfigurator = $(configureColumnsColumnChooserSelector);
    var config = {
      configPath: $metricsConfigurator.data("analyticscfg"),
      contentPath: $metricsConfigurator.data("contentpath"),
      metricId: $activator.data("metric"),
      $activator: $activator
    };

    removeCustomAnalyticsColumn(config);
  }

  function hideColumns($collection) {
    if (!isTableLayout()) {
      return;
    }

    // re-sets the hidden attribute to ensure newly-loaded result columns are hidden
    $collection.find('col').each(function() {
      var hidden = $(this).get(0).hidden;

      if (hidden) {
        // we show and hide in succession to bypass the value must change constraint
        $(this).get(0).hidden = false;
        $(this).get(0).hidden = true;
      }
    });
  }

  function setupListeners() {
    var $dialog = $(configureColumnsDialogSelector);

    if ($dialog.length > 0) {
      Coral.commons.ready($dialog[0], function() {
        $dialog[0].off("coral-overlay:beforeopen").on("coral-overlay:beforeopen", function(event) {
          if (event.target !== $dialog[0]) {
            return;
          }

          resetDialog();
        });
      });

      if ($(pathConfigSelectSelector).length > 0) {
        Coral.commons.ready($(pathConfigSelectSelector)[0], function() {
          $(pathConfigSelectSelector)[0].off("change").on("change", onManageColumnsForPathChange);
        });
      }

      $(configureColumnsFormSelector + " " + columnsSelector).off("change").on("change", onColumnSelected);
      $(removeCustomAnalyticsColumnSelector).off("click").on("click", onRemoveCustomAnalyticsColumn);

      $(configureColumnsConfirmSelector).off("click").on("click", function(event) {
        event.preventDefault();
        updateCookieAndReload();

        return false;
      });

      $(".aem-add-custom-analytics-data").off("click").on("click", function(event) {
        event.preventDefault();

        // hides the configure columns dialog
        var $addCustomAnalyticsColumnsToggle = $(this);
        var $dialog = $addCustomAnalyticsColumnsToggle.closest(configureColumnsDialogSelector);

        if ($dialog.length > 0) {
          $dialog[0].open = false;
        }
      });
    }
  }

  function setup() {
    var $configureColumnsForm = $(configureColumnsFormSelector);

    if (!isTableLayout() || $configureColumnsForm.length === 0) {
      return;
    }

    // caches columns information and initialises selections
    columnsQuota = calculateColumnsQuota();
    totalSelectableColumns = $configureColumnsForm.find(columnsSelector).length;
    initialSelection = getSelection(configureColumnsFormSelector);

    // updates the UI based on the selection
    var totalSelected = $configureColumnsForm.find(selectedColumnSelector).length;
    updateDialogTitle(totalSelected, totalSelectableColumns);
    toggleAddCustomAnalyticsColumns();
    togglePathConfig();
    updateCheckboxStates();
  }

    function getCurrentCollectionOfInterest() {
        var $searchCollection = $('#granite-omnisearch-result');
        return $searchCollection.length === 1 ? $searchCollection : $('.foundation-collection');
    }

  $(document).on("foundation-contentloaded", function (event) {
    var $collection = getCurrentCollectionOfInterest();
    if (!isTableLayout() || $(configureColumnsFormSelector).length === 0) {
      hideColumns($collection);
      return;
    }

    setup();
    setupListeners();
    hideColumns($collection);

    isSetup = true;
  });

})(document, Granite, Granite.$);
/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2016 Adobe Systems Incorporated
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

  var ui = $(window).adaptTo("foundation-ui");

  var manageColumnsForPathSelector = ".manage-columns-for-path-select"; // <coral-select> in the configure columns dialog

  var selectedColumnSelector = "[type='checkbox']:checked";
  var customAnalyticsColumnsDialogSelector = ".aem-custom-analytics-columns-dialog";
  var addCustomAnalyticsColumnConfirmSelector = ".aem-custom-analytics-columns-add-command";
  var customAnalyticsColumnDataSelector = "input[name='customanalyticsdata']";
  var customAnalyticsColumnsMetricsSelector = ".aem-AnalyticsMetrics";

  var initialSelection = [];
  var initialMetricsPath = "";

  function reloadContent() {
    var isSearchResult = $('.cq-PredicateBreadcrumbs').length > 0;
    var $searchPanel = $('.searchpanel');

    if (isSearchResult) {
      // re-submits the search form, and by doing so content is updated
      $searchPanel.submit();
    } else {
      window.location.reload();
    }
  }

  function isTableLayout() {
    var $collection = $(".foundation-collection");
    return ($collection.length > 0 && $collection.first().hasClass("foundation-layout-table"));
  }

  function getSelection() {
    var selection = [];
    var $items = $(customAnalyticsColumnsDialogSelector).find(selectedColumnSelector);

    for (var i = 0 ; i < $items.length; i++) {
      selection.push($($items[i]).val());
    }

    return selection;
  }

  function resetDialog() {
    var $customAnalyticsColumnsMetrics = $(customAnalyticsColumnDataSelector);

    // restores initial selection
    $customAnalyticsColumnsMetrics.each(function(index) {
      var $metric = $(this);

      $metric.prop("checked", ($.inArray($metric.val(), initialSelection) >= 0));
    });

    // fetches metrics for path is different to the original
    var select = $(manageColumnsForPathSelector)[0];
    if (select && select.value !== initialMetricsPath) {
      onManageMetricsForPathChange();
    }
  }

  function onAddCustomAnalyticsColumnsConfirm(event) {
    event.preventDefault();

    var $activator = $(event.target);
    var $dialog = $activator.closest(customAnalyticsColumnsDialogSelector);
    var $form = $dialog.find("form");
    var $metricsConfigurator = $form.find("[data-analyticscfg]");
    var analyticsConfigPath = $metricsConfigurator.data("analyticscfg");
    var contentPath = $metricsConfigurator.data("contentpath");

    Granite.$.ajax({
      type: "POST",
      url: analyticsConfigPath + "/jcr:content.customdata.config",
      data: $form.serialize() + "&contentpath=" + contentPath,
      success: function(data, status, request) {
        reloadContent();
      },
      error: function() {
        ui.notify("", Granite.I18n.get("Error occurred while trying to save custom analytics data selection."), "error");
      }
    });
  }

  function updateMetricsForPath(url) {
    var $analyticsMetrics = $(customAnalyticsColumnsMetricsSelector);

    ui.wait($analyticsMetrics[0]);

    Granite.$.ajax({
      type: "GET",
      url: url,
      success: function(data, status, request) {
        $analyticsMetrics.replaceWith(data);

        setup();
      },
      error: function() {
        ui.notify("", Granite.I18n.get("Error occurred while loading custom column data."));
      },
      always: function() {
        ui.removeWait();
      }
    });
  }

  var sanitizeInternalURL = function(urlToSanitize){
          if(/^(https?:)?\/\//i.test(urlToSanitize)){
  			return urlToSanitize.replace(/^(https?:)?\/\//i, "");
          }
          else {
              return urlToSanitize;
          }
      }

  function onManageMetricsForPathChange() {
    var select = $(manageColumnsForPathSelector)[0];
    var selectedContentPath = select.value;
    var $analyticsMetrics = $(customAnalyticsColumnsMetricsSelector);
    var customColumnDataComponentPath = sanitizeInternalURL($analyticsMetrics.data('component-path'));
    var url = customColumnDataComponentPath + ".html" + selectedContentPath;

    updateMetricsForPath(url);
  }

  function setupEventListeners() {
      var $dialog = $(customAnalyticsColumnsDialogSelector);

      if ($dialog.length > 0) {
        $(addCustomAnalyticsColumnConfirmSelector).off("click").on("click", onAddCustomAnalyticsColumnsConfirm);

        // ensures the dialog is ready, as it's lazy-loaded.
        Coral.commons.ready($dialog[0], function() {
          $dialog[0].off("coral-overlay:beforeopen").on("coral-overlay:beforeopen", function(event) {
            if (event.target !== $dialog[0]) {
              return;
            }

            resetDialog();
          });
        });
      }
  }

  function setup() {
    if (!isTableLayout()) {
      return;
    }

    if ($(manageColumnsForPathSelector).length > 0) {
      Coral.commons.ready($(manageColumnsForPathSelector)[0], function() {
        initialMetricsPath = $(manageColumnsForPathSelector)[0].value;
      });
    }

    initialSelection = getSelection();
  }

  $(document).on("foundation-contentloaded", function (event) {
    setup();
    setupEventListeners();
  });

})(document, Granite, Granite.$);
