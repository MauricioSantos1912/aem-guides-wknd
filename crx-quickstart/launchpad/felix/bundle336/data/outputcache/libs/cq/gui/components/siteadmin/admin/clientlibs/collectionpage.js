var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(e){var b=0;return function(){return b<e.length?{done:!1,value:e[b++]}:{done:!0}}};$jscomp.arrayIterator=function(e){return{next:$jscomp.arrayIteratorImpl(e)}};$jscomp.makeIterator=function(e){var b="undefined"!=typeof Symbol&&Symbol.iterator&&e[Symbol.iterator];return b?b.call(e):$jscomp.arrayIterator(e)};
(function(e,b){function g(a,d){a=b(a).find(".foundation-collection-quickactions").data("foundationCollectionQuickactionsRel")||"";a=a.trim();return 0<=(a.length?a.split(/\s+/):[]).indexOf(d)}function h(a){var d=a.length;return 0===d?!1:1===d?g(a.first(),"cq-siteadmin-admin-actions-properties-activator"):!a.toArray().some(function(f){f=b(f);var c=f.data("cqPageLivecopy");void 0!==c?c=!!c:(c=f.find("[data-cq-page-livecopy]").data("cqPageLivecopy"),c=void 0!==c?!!c:!1);return c?!0:!g(f,"cq-siteadmin-admin-actions-properties-activator")})}
function l(a,d){a=b(a).attr("data-granite-collection-item-id")+".1.json";b.ajax({type:"GET",url:Granite.HTTP.externalize(a)}).done(function(f){JSON.stringify(f).includes("jcr:content")?(k.setEmpty(!1),k.isEmpty||d.removeAttr("hidden")):(k.setEmpty(!0),d.attr("hidden","hidden"))}).fail(function(){k.setEmpty(!0);d.attr("hidden","hidden")})}var k={isEmpty:!1,setEmpty:function(a){this.isEmpty||(this.isEmpty=a)},resetPageValue:function(){this.isEmpty=!1}};b(e).on("foundation-selections-change",".foundation-collection",
function(){var a=b(".cq-siteadmin-admin-actions-properties-activator");if(a.length){var d=b(this),f=a.data("foundationCollectionAction");if(d.is(f.target)){d=b(".foundation-selections-item");f=$jscomp.makeIterator(d);for(var c=f.next();!c.done;c=f.next())c=c.value,k.resetPageValue(),l(c,a),h(d)&&!k.isEmpty?a.removeAttr("hidden"):a.attr("hidden","hidden")}}})})(document,Granite.$);
(function(e,b){b(e).on("foundation-layout-perform",".foundation-collection",function(g){var h=b("table.cq-siteadmin-admin-childpages.foundation-layout-table");if(0<h.length&&g.target===h[0]){g=b(".foundation-collection-meta").data("foundation-collection-meta-primarytype");var l=h.data("orderable-types")||"cq:Page,sling:OrderedFolder";l=l.replace(/ /g,"").split(",");h[0].orderable=l.includes(g)}})})(document,Granite.$);