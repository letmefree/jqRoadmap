/*
 * jqRoadmap plugin for jQuery framework - simple guide for heavy road 2 all users & webmasters
 *   (http://brainstorage.me/pushthebutton)
 *
 * Copyright (c) 2013 Evgeny Zacharov
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 * 
 * $Version: 20/01/2014 r8
 */
(function ($) {  
    $.Roadmap = $.Roadmap || {};
    $.extend($.Roadmap, {
        extend: function (methods) {
            $.extend($.fn.Roadmap, methods);
            if (!this.no_legacy_api) {
                $.fn.extend(methods);
            }
        }
    });

    $.fn.Roadmap = function (options) {
        var options = $.extend({
            onInit: null,
            allowJump: true,
            voyagerSpeed : 300,
            voyagerPosition: 0,
            formsContainer: "",
            checkpoints: [],
            onloadEvent: null,
            checkpointClickEvent: null,
            ckeckpointNext: null,
            checkpointPrev: null,
            width: 400,            
        }, options);

        var version = 200114;
            $roadmap = $("<div>").addClass("roadmap"),            
            $voyager = $("<div>").addClass("voyager"),
            $formsContainer = $(options.formsContainer),
            voyagerPosition = options.voyagerPosition,
            voyagerOffset = -1;

        var methods = {
            determineWidth: function ($obj) {
                var r = /[px|em]{2,}/g,
                    w = 0;

                w += parseInt($obj.css("padding-left").replace(r, ""));
                w += parseInt($obj.css("padding-right").replace(r, ""));
                w += parseInt($obj.css("border-left-width").replace(r, ""));
                w += parseInt($obj.css("border-right-width").replace(r, ""));
                w += parseInt($obj.css("margin-left").replace(r, ""));
                w += parseInt($obj.css("margin-right").replace(r, ""));
                return w;
            },
            validateFailed: function (isInvalid, $obj) {
                if (isInvalid) {
                    $obj.addClass("invalid");
                } else {
                    $obj.removeClass("invalid");
                }
            },
            validateInput: function ($obj, pattern) {
                if (typeof (pattern) != undefined) {
                    var isRegexSuccess = $obj.val().match(pattern);
                    if (isRegexSuccess) {
                        methods.validateFailed(false, $obj);
                        return true;
                    }
                    else {
                        methods.validateFailed(true, $obj);
                        return false;
                    }
                }
                else {
                    methods.validateFailed(true, $obj);
                    return true;
                }
            }
        };

        var make = function () {
            $(this)
                .css("width", options.width)
                .css("display","none");

            var $mark = $("<div>").addClass("mark"),
                $map = $("<div>").addClass("map"),
                $checkpoint = {};               

                
            $(options.checkpoints).each(function (i, o) {
                $checkpoint = $("<div>").addClass("checkpoint");
                $checkpoint
                    .append($("<div>"))
                    .click(function (e) {
                        if (((options.allowJump || !e.originalEvent) || (!options.allowJump && voyagerPosition > i)) &&
                            $(e.target).closest(".voyager").length == 0) {
                            
                            var ts = $(this),
                                tsOffset = ts.offset(),
                                rmOffset = $roadmap.offset();

                            voyagerPosition = i;
                            if (voyagerOffset < 0) {
                                voyagerOffset = $voyager.offset().left;
                                $voyager.css("left", voyagerOffset);
                            }

                            $voyager.animate({ left: (voyagerOffset + tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) }, 400);

                            if ($formsContainer &&
                                $formsContainer.length &&
                                o.form !== undefined)
                            {
                                $formsContainer
                                    .find("div[role=form]").hide().end()
                                    .find(o.form).show();
                            }

                            $("div.mark")
                                .find("div.marklabel").removeClass("active").end()
                                .find("div.marklabel:eq(" + i + ")").addClass("active");

                            /* callback, срабатывает при переходе текущий шаг и возвращает текущую позицию на карте */
                            if (o.hndl != null &&
                                typeof (o.hndl) === "function") {
                                o.hndl(voyagerPosition);
                            }
                        }
                    });

                $map.append($checkpoint);

                if (i < options.checkpoints.length - 1) {
                    $map.append($("<div>").addClass("road"))
                    $mark
                        .append($("<div>").addClass("marklabel").html(o.text))
                        .append($("<div>").addClass("road"));
                }
                else {
                    $map.append($("<div>").addClass("clear"));
                    $mark.append($("<div>").addClass("marklabel").html(o.text))
                }
            });

            /* аппендим все созданные элементы на страницу*/
            $roadmap
                .append($map)
                .append($mark); 

            $(this).append($roadmap);
            
            /* расчитываем длину дорожек */
            var roadLength = 0,
                checkpointsTotalLength = 0;

            checkpointsTotalLength += methods.determineWidth($checkpoint.find("div"));
            checkpointsTotalLength += methods.determineWidth($checkpoint);

            roadLength = Math.floor((options.width - checkpointsTotalLength * 4) / 3);
            roadLength -= methods.determineWidth($map);
            roadLength -= methods.determineWidth($(".road", $map));
            
            /* отрисовываем на документе */
            $map
                .find(".road").width(roadLength).end()
                .find(".checkpoint").eq(voyagerPosition).prepend($voyager).end();

            $mark
                .find(".marklabel:eq(" + voyagerPosition + ")").addClass("active").end()
                .find(".marklabel").width(checkpointsTotalLength).end()
                .find(".road").width(roadLength).end();   

            /* 
                onInit handler, выполняем его
                все готово к отображению плагина
            */
            if (options.onInit != null &&
                typeof (options.onInit) === "function") {
                options.onInit();
            }

            $(this).show();
            $map.find(".checkpoint").eq(voyagerPosition).trigger("click");
        };


        $.Roadmap.extend({
            CurrentPosition: function () {
                return voyagerPosition;
            },
            MoveNext: function () {
                if (voyagerPosition + 1 < options.checkpoints.length) {
                    if (options.checkpoints[voyagerPosition].validate &&
                        options.checkpoints[voyagerPosition].validate.length > 0) {

                        var validateArray = options.checkpoints[voyagerPosition].validate,
                            validateState = true;

                        
                        $.each(validateArray, function (id, item) {
                            var $object = $(item.item);
                            if ($object.length > 0) {
                                validateState = methods.validateInput($object, item.pattern);
                                if (typeof (item.handler) === "function") {
                                    item.handler(validateState);
                                };
                            }
                        });

                        if (!validateState) {
                            return;
                        }                        
                    }

                    ++voyagerPosition;
                    $("div.roadmap .checkpoint:eq(" + voyagerPosition + ")").trigger("click");

                    if (typeof (options.ckeckpointNext) === "function") {
                        options.ckeckpointNext(voyagerPosition);
                    }
                }
            },
            MovePrev: function () {

                if (voyagerPosition - 1 >= 0) {
                    --voyagerPosition;

                    $("div.roadmap .checkpoint:eq(" + voyagerPosition + ")").trigger("click");

                    if (typeof (options.ckeckpointPrev) === "function") {
                        options.ckeckpointPrev(voyagerPosition);
                    }
                }
            },
            Version: function () {
                return version;
            }
        });

        return this.each(make);
    };

})(jQuery);