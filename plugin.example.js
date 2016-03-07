
var example = (function(){
    var Plugin = function(){
        // mandatory spec...
        this.template = '<div></div>';
    };

    Plugin.prototype = {
        /** @mandatory */
        clone: function() {
            return new Plugin();
        },
        /** @cycle */
        onCreate: function(data) {

        },
        /** @cycle */
        onRender: function() {

        }
    };
    
    return new Plugin();
}());

/** example usage */

$('#tree').bigtree({
    markup: '...',
    plugins: [
        example
    ] 
});

$('#tree').bigtree('load', data, true);
