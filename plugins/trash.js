
var TrashPlugin = (function(){
    
    var Plugin = function(){
        this.template = '<a class="btn btn-default btn-xs" href="#"><i class="fa fa-trash-o></i>{{:this.text}}</a>';
    };
    
    Plugin.prototype = {
        update: function() {
            this.text = 'Remove';  
        },
        onInit: function(tree, data) {
            this.tree = tree;
            this.data = data;
        },
        onRender: function() {
            var me = this;
            this.element.on('click', function(){
                me.tree.remove(me.data);
            });
        }
    }
    
    return Plugin;
}());
