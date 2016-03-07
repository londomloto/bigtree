
var example = (function(){
    var Plugin = function(){
        // mandatory spec...
        this.template = '<div></div>';
    };

    Plugin.prototype = {
        /** @cycle */
        onCreate: function(data) {

        },
        /** @cycle */
        onRender: function() {

        }
    };
}());

/** example usage */

$('#tree').bigtree({
    markup: '...',
    plugins: [
        example
    ] 
});

$('#tree').bigtree('load', data, true);
