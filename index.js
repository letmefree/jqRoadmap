/* some page methods */
$(function () {

    var bd = $("select[name=birthday]"),
        by = $("select[name=birthyear]");

    for (i = 31; i >= 1; i--) {
        bd.append($("<option>").attr("value", i).html(i));
    }

    for (i = new Date().getFullYear() ; i >= 1950; i--) {
        by.append($("<option>").attr("value", i).html(i));
    }

    by.find("option[value=" + (new Date().getFullYear() - 22) + "]").attr("selected", "selected");
});