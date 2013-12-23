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
            checkpoints: [],
            onloadEvent: null,
            checkpointClickEvent: null,
            ckeckpointNext: null,
            checkpointPrev: null,
            width: 400,            
        }, options);

        var $roadmap = $("<div>").addClass("roadmap"),
            $voyager = $("<div>").addClass("voyager"),
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

                return w;
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
                        if (options.allowJump ||
                            !e.originalEvent) {
                            var ts = $(this),
                                tsOffset = ts.offset(),
                                rmOffset = $roadmap.offset();

                            voyagerPosition = i;
                            /*
                            странное поведение Chromium версии от 28.0.1482.0 (194616)
                                $.css("-webkit-transform") не примен€етс€.  омментирую, да будет $.animate :-)

                            $voyager
                                .css("-webkit-transform", "translateX(" + (tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) + "px")
                                .css("-moz-transform", "translateX(" + (tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) + "px")
                                .css("-ms-transform", "translateX(" + (tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) + "px")
                                .css("-o-transform", "translateX(" + (tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) + "px")
                                .css("transform", "translateX(" + (tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) + "px");
                            */
                            if (voyagerOffset < 0) {
                                voyagerOffset = $voyager.offset().left;
                                $voyager.css("left", voyagerOffset);
                            }

                            $voyager.animate({ left: (voyagerOffset + tsOffset.left - rmOffset.left - parseInt($map.css("padding-left"))) }, 400);

                            $("div.mark")
                                .find("div.marklabel").removeClass("active").end()
                                .find("div.marklabel:eq(" + i + ")").addClass("active");

                            /* вызываем callback, если он был задан (срабатывает при переходе на новый шаг) */
                            if (options.checkpointClickEvent != null &&
                                typeof (options.checkpointClickEvent) === "function") {
                                options.checkpointClickEvent(voyagerPosition);
                            }
                        }
                    });

                $map.append($checkpoint);

                if (i < options.checkpoints.length - 1)
                    $map.append($("<div>").addClass("road"))
                else $map.append($("<div>").addClass("clear"));

                $mark
                    .append($("<div>").addClass("marklabel").html(o.text))
                    .append($("<div>").addClass("road"));
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

            roadLength = Math.floor((options.width - checkpointsTotalLength * 3) / (options.checkpoints.length));

            /* отрисовываем на документе */
            $map
                .find(".road").width(roadLength).end()
                .find(".checkpoint:eq(" + voyagerPosition + ")").prepend($voyager).end();



            //debugger;
            //$voyager.css("left", $(".checkpoint:eq(" + voyagerPosition + ")", $map).offset().left);

            $mark
                .find(".marklabel:eq(" + voyagerPosition + ")").addClass("active").end()
                .find(".marklabel").width(checkpointsTotalLength).end()
                .find(".road").width(roadLength).end();   

            debugger;

            /* 
                если было назначен обработчик onInit, выполн€ем его
                и все готово к отображению плагина
            */
            if (options.onInit != null &&
                typeof (options.onInit) === "function") {
                options.onInit();
            }
            $(this).show();

            
            /// Ќе актуально
            ///*  
            //    вызываем обработчик изменени€ шана, если он был задан
            //    в данном случае работает по событию init, когда плагин был инициализирован первый раз
            //*/
            //if (options.checkpointClickEvent != null &&
            //    typeof (options.checkpointClickEvent) === "function") {
            //    options.checkpointClickEvent(voyagerPosition);
            //}
        };


        $.Roadmap.extend({
            currentPosition: function () {
                return voyagerPosition;
            },
            moveNext: function () {

                if (voyagerPosition + 1 < options.checkpoints.length) {
                    ++voyagerPosition;

                    $("div.roadmap .checkpoint:eq(" + voyagerPosition + ")").trigger("click");

                    if (typeof (options.ckeckpointNext) === "function") {
                        options.ckeckpointNext(voyagerPosition);
                    }                    
                }
            },
            movePrev: function () {

                if (voyagerPosition - 1 >= 0) {
                    --voyagerPosition;

                    $("div.roadmap .checkpoint:eq(" + voyagerPosition + ")").trigger("click");

                    if (typeof (options.ckeckpointPrev) === "function") {
                        options.ckeckpointPrev(voyagerPosition);
                    }
                }
            }
        });

        return this.each(make);
    };

})(jQuery);