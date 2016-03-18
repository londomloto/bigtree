/**
 * Bigtree
 *
 * jQuery plugin for rendering hierarchical data
 * Dependencies:
 *      - jQuery (https://jquery.com)
 *      - jQuery UI (https://jqueryui.com)
 *      - jsRender (https://www.jsviews.com)
 *      - jQuery Throttle (http://benalman.com/pr
 *      ojects/jquery-throttle-debounce-plugin/)
 *
 * @author Roso Sasongko <roso@kct.co.id>
 */
(function($, undef){
    // preparing for striptags
    /*var bodyre = '((?:[^"\'>]|"[^"]*"|\'[^\']*\')*)',
        tagsre = new RegExp(
            '<(?:'
            + '!--(?:(?:-*[^->])*--+|-?)'
            + '|script\\b' + bodyre + '>[\\s\\S]*?</script\\s*'
            + '|style\\b' + bodyre + '>[\\s\\S]*?</style\\s*'
            + '|/?[a-z]'
            + bodyre
            + ')>',
            'gi'
        );*/
    
    /**
     * Cast element to jQuery object
     */
    function make(el) {
        return el instanceof jQuery ? el : $(el);
    }

    /**
     * Get index of element from array.
     * This is fastest method rather than using Array.indexOf by avoiding
     * several type checking. See polyfill:
     * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
     */
    function indexof(array, elem) {
        var size = array.length, i = 0;
        while(i < size) {
            if (array[i] === elem) {
                return i;
            }
            i++;
        }
        return -1;
    }

    function firstof(array) {
        array = array || [];
        return array[0];
    }

    function lastof(array) {
        array = array || [];
        return array[array.length - 1];
    }

    /**
     * Select text inside particular input field.
     * Don't confuse with $.select, which actualy used for triggering `select` event.
     */
    function seltext(input, beg, end) {
        var dom = input[0], range;

        beg = beg === undef ? 0 : beg;
        end = end === undef ? input.val().length : end;
        
        if (dom.setSelectionRange) {
            dom.setSelectionRange(beg, end);
            if (/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())) {
                var evt = jQuery.Event('keydown', {which: 37});
                input.triggerHandler(evt);
            }
        } else if (dom.createTextRange) {
            range = dom.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', beg);
            range.select();
        }
    }

    function debug() {
        var 
            args = $.makeArray(arguments),
            arr = ['[' + args.shift() + ']'];

        for (var i = 0, j = args.length; i < j; i++) {
            arr.push(' ; ');
            arr.push(args[i]);
        }

        console.log.apply(console, arr);
    }

    /**
     * Sanitize (remove) html tags from string
     */
    /*function striptags(txt) {
        var old;
        do {
            old = txt;
            txt = txt.replace(tagsre, '');
        } while (txt != old);
        return txt.replace(/</g, '&lt;');
    }*/

    /**
     * Special counter for cached template,
     * avoids template overriding
     *
     * @type {Number}
     */
    var template = 0;

    /**
     * Constructor
     */
    var BigTree = function (element, options) {
        this.element = $(element);
        this.init(options);
    };

    /**
     * Default options
     */
    BigTree.defaults = {

        fields: {
            id: 'id',
            text: 'text',
            left: 'left',
            right: 'right',
            level: 'level',
            leaf: 'leaf',
            path: 'path',
            expand: 'expand'
        },

        // item height
        itemSize: 32,
        
        // drag handle width
        dragSize: 16,
        
        // level width
        stepSize: 25,
        
        // gutter from left
        guttSize: 20,

        // scroll speed
        delay: 30,

        // leading & trailing rendered nodes
        buffer: 0,

        // node markup, can contains templating tags supported by jsRender
        markup: '<div class="bt-node bt-hbox {{if _last}}bt-last{{/if}}" '+
                    'data-id="{{:id}}" '+
                    'data-level="{{:level}}" '+
                    'data-leaf="{{:leaf}}">'+
                    '{{for _elbows}}'+
                        '<div class="bt-node-elbow {{:type}}">{{:icon}}</div>'+
                    '{{/for}}'+
                    '<div class="bt-node-body bt-flex bt-hbox">'+
                        '<div class="bt-drag"></div>'+
                        '<div class="bt-plugin head"></div>'+
                        '<div class="bt-text bt-flex bt-hbox">{{:text}}</div>'+
                        '<div class="bt-plugin tail"></div>'+
                        '<div class="bt-trash"></div>'+
                    '</div>'+
                '</div>',

        plugins: [],

        debug: true
    };

    /**
     * Prototype
     */
    BigTree.prototype = {
        init: function(options) {
            this.options = $.extend(true, {}, BigTree.defaults, options || {});

            this._buffedge = Math.floor(this.options.buffer / 2) * this.options.itemSize;
            this._data = [];
            this._indexes = {};

            this._ranges = [0, 0];
            this._visible = [];
            this._message = '';
            this._uuid = []; 

            this._helper = {};

            this._initComponent();
            this._initEvents();
            this._fireEvent('init');

        },
        _guid: function() {

            if ( ! this._uuid.length)
                for (var i = 0; i < 256; i++)
                    this._uuid[i] = (i < 16 ? '0' : '') + (i).toString(16);

            var 
                uu = this._uuid,
                d0 = Math.random()*0xffffffff|0,
                d1 = Math.random()*0xffffffff|0,
                d2 = Math.random()*0xffffffff|0,
                d3 = Math.random()*0xffffffff|0;

            return uu[d0&0xff]+uu[d0>>8&0xff]+uu[d0>>16&0xff]+uu[d0>>24&0xff]+
                uu[d1&0xff]+uu[d1>>8&0xff]+
                uu[d1>>16&0x0f|0x40]+uu[d1>>24&0xff]+
                uu[d2&0x3f|0x80]+uu[d2>>8&0xff]+
                uu[d2>>16&0xff]+uu[d2>>24&0xff]+
                uu[d3&0xff]+uu[d3>>8&0xff]+uu[d3>>16&0xff]+uu[d3>>24&0xff];
        },
        /** @private */
        _initComponent: function() {
            var 
                options = this.options,
                fields = options.fields;

            this.element.addClass('bigtree').attr('tabindex', 1);

            this.editor = $('<div class="bt-editor"><input type="text"></div>');
            this.edtext = this.editor.children('input');
            this.grid   = $('<div class="bt-grid">').appendTo(this.element);
            // this.grid.addClass('test');

            // setup template
            this._setupTemplate();

            // init sortable
            this.element.sortable({
                items: '.bt-node',
                handle: '.bt-drag',
                placeholder: 'bt-node-sortable ui-sortable-placeholder'
            });
        },
        /** @private */
        _initEvents: function() {
            var options = this.options;

            this._scrolltop = this.element.scrollTop();
            this._scrolldir = '';
            this._scrolldif = 0;
            this._busy = false;

            // unbinds
            this.element.off('scroll.bt click.bt.expander keydown.bt sortstart.bt sortstop.bt click.bt.select click.bt.startedit');
            this.edtext.off('click.bt keypress.bt');

            this.element.on({
                'scroll.bt': $.throttle(options.delay, $.proxy(function(){
                    // we need hold until grid render finished
                    if (this._busy) return;
                    
                    this._busy = true;
                    this._onScroll();
                    this._busy = false;
                }, this)),
                // 'scroll.bt': $.debounce(options.delay, $.proxy(this._onScroll, this)),
                'keydown.bt': $.proxy(this._onNavigate, this),
                'sortstart.bt': $.proxy(this._onBeforeDrag, this),
                'sortstop.bt': $.proxy(this._onAfterDrag, this),
                'click.bt.select': $.proxy(function(){ this.deselectAll(); }, this)
            });

            this.element.on('click.bt.expander', '.elbow-expander', $.proxy(this._onExpanderClick, this));

            this.element.on('click.bt.startedit', '.bt-text', $.proxy(function(e){
                e.stopPropagation();
                var node = $(e.currentTarget).closest('.bt-node');
                this._startEdit(node);
            }, this));

            this.edtext.on({
                'click.bt': function(e){
                    e.preventDefault();
                    e.stopPropagation();
                },
                'keypress.bt': $.proxy(function(e){
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        this._stopEdit(false);
                    }
                }, this)
            });
        },
        /** @private */
        _setupTemplate: function() {
            var 
                plugins = this.options.plugins,
                markup = $(this.options.markup),
                tail = markup.find('.bt-plugin.tail'),
                head = markup.find('.bt-plugin.head'),
                regex = new RegExp('({[^{]+)this.', 'g');

            // add attr data-index to markup
            markup.attr('data-index', '{{:index}}');

            $.each(plugins, $.proxy(function(i, p){
                if (p.template) {
                    // mandatory function
                    var proto = p.constructor.prototype;

                    if (proto.update === undef) {
                        $.extend(proto, {update: $.noop})
                    }

                    p.id = p.id === undef ? i : p.id;
                    // we need to replace some placeholder
                    p.templateString = p.template; // save orig
                    p.template = p.template.replace(regex, '$1__' + p.id + '__');
                    // console.log(p.template);
                    var prop, key;

                    for (var prop in p) {
                        if (p.hasOwnProperty(prop)) {
                            if ($.type(p[prop]) === 'function') {
                                key = '__' + p.id + '__' + prop;
                                this._helper[key] = p[prop];
                            }
                        }
                    }

                    $(p.template).attr('data-plugin-id', p.id).appendTo(p.place == 'tail' ? tail : head);
                }    
            }, this));

            markup = $('<div>').append(markup).remove().html();
            regex  = null;

            // this.options.markup = markup;

            $.templates('btnode_' + (++template), markup);
        },

        /** @private */
        _reindex: function(start, stop) {
            var fields = this.options.fields, i;
            
            start = start === undef ? 0 : start;
            stop  = stop  === undef ? this._data.length : stop;

            for (i = start; i < stop; i++)  {
                this._data[i].index = i;
                this._indexes[this._data[i][fields.id]] = i;
            }
        },
        /** @private */
        _rebuild: function(start, stop) {
            var 
                fields = this.options.fields,
                root = null;

            var i;
            
            start = start === undef ? 0 : start;
            stop  = stop  === undef ? this._data.length : stop;

            if (start > 0 && this._data[start]) {
                root  = this._data[start]._root || null;
            }

            for (i = start; i < stop; i++) {
                var 
                    cur = this._data[i],
                    key = cur[fields.id];

                // actualy prepare for metadata
                cur._elbows = [];
                cur._level  = 0;

                if (+cur[fields.level] === 0) {
                    if (root) {
                        root._last = false;
                    }
                    
                    cur._root   = null;
                    cur._parent = null;
                    cur._last   = true;
                    cur._hidden = false;

                    root = cur;
                } else  {
                    var pid = cur[fields.path].split('/'), par, chd;

                    pid.pop();
                    pid = pid.pop();

                    par = this._data[this._indexes[pid]];
                    par._child = par._child || [];

                    chd = this._data[this._indexes[lastof(par._child)]];
                    if (chd) chd._last = false;

                    cur._root   = root;
                    cur._parent = par;
                    cur._last   = true;
                    cur._hidden = +par[fields.expand] === 0 || par._hidden;

                    par._child.push(cur[fields.id]);
                }

                cur._metachanged = true;
                
            }
        },
        /** @private */
        _renderRange: function(stacks, start, end) {
            var 
                plugins = this.options.plugins,
                fields = this.options.fields,
                range = stacks.slice(start, end),
                moved = this.movedNode(),
                psize = plugins.length;

            if (moved.length) {
                range = $.grep(range, function(d){
                    return d[fields.id] != moved.attr('data-id');
                });
            }

            this._suspendPlugins(this._visible);
            
            this.editor.detach();
            this.removableNodes().remove();

            this._ranges = [start, end];
            this._visible = range;
            this._fireEvent('beforerender', range);

            // prepare rendering node
            for (var i = 0, ii = range.length; i < ii; i++) {
                var data = range[i];

                if (data._metachanged) {
                    data._metachanged = false;
                    var
                        isexpand = +data[fields.expand] === 1,
                        isparent = +data[fields.leaf] === 0,
                        level = +data[fields.level],
                        elbows = [],
                        lines = [],
                        owner = data._parent;

                    var type, icon, cls;
                        
                    while(owner) {
                        lines[owner[fields.level]] = owner._last ? 0 : 1;
                        owner = owner._parent;
                    }

                    for (var j = 0; j <= level; j++) {
                        if (j === level) {
                            type = 'elbow-end';
                            icon = isparent 
                                ? '<span class="elbow-expander ' + (isexpand ? 'elbow-minus' : 'elbow-plus') + '"></span>' 
                                : '';
                        } else {
                            type = lines[j] === 1 ? 'elbow-line' : '';
                            icon = '';
                        }
                        elbows.push({
                            type: type,
                            icon: icon
                        });
                    }
                    data._elbows = elbows;
                }

                // attach plugins
                var plugin, k;

                if (data.plugins === undef) {
                    data.plugins = {};
                    for (k = 0; k < psize; k++) {
                        plugin = $.extend({}, plugins[k]);
                        data.plugins[plugin.id] = plugin;
                        plugin.onInit(this, data);
                        plugin.update();
                        this._mixinData(data, plugin);
                    }
                } else {
                    for (k in data.plugins) {
                        data.plugins[k].update();
                        this._mixinData(data, data.plugins[k]);
                    }
                }

            }

            var html = $.templates['btnode_'+template](range, this._helper);
            this.grid.append(html);

            if (moved.length) {
                this.element.sortable('refresh');
            } else {
                this._decorate();
            }

            var visnode = this.visibleNodes();

            this._renderPlugins(this._visible, visnode);
            this._fireEvent('render', visnode, this._visible);
        },
        /** @private */
        _decorate: function() { 
            if (this._selected) {
                var snode = this.grid.find('.bt-node[data-id='+this._selected+']');
                if (snode.length) this.select(snode);
            }
        },
        /** @private */
        _mixinData: function(data, plugin) {
            if (plugin.templateString && ! /this\./g.test(plugin.templateString)) {
                return;
            }

            var id = plugin.id;
            var value, prop, type, key;

            data.mixins = data.mixins || {};

            if (data.mixins[id] === undef) {
                data.mixins[id] = {};
                for (prop in plugin) {
                    if (plugin.hasOwnProperty(prop)) {
                        value = plugin[prop];
                        type = $.type(value);

                        // we only permit scalar & literal object
                        if ((' node element template templateString '.indexOf(prop) > -1) || 
                            (type == 'function') || 
                            (type == 'object' && value.constructor !== Object) || 
                            (value == this || value == data)
                        ) { continue; }

                        // create protected key
                        key = '__' + plugin.id + '__' + prop; 
                        data[key] = plugin[prop];
                        data.mixins[id][key] = prop;
                    }
                }
            } else {
                for (key in data.mixins[id]) {
                    prop = data.mixins[id][key];
                    data[key] = plugin[prop];
                }
            }
        },
        /** @private */
        _renderPlugins: function(datas, nodes) {
            if ( ! this.options.plugins.length) return;
            
            var node, data, name, plugin;

            for (var i = 0, ii = nodes.length; i < ii; i++) {
                node = $(nodes[i]);
                data = datas[i];
                for (name in data.plugins) {
                    plugin = data.plugins[name];
                    
                    if (plugin.element) {
                        plugin.element.remove();
                        plugin.element = null;
                        plugin.node = null;
                    }
                    
                    plugin.node = node;
                    plugin.element = node.find('[data-plugin-id='+plugin.id+']');
                    plugin.onRender();

                }
            }
        },
        /** @private */
        _suspendPlugins: function(datas) {
            if ( ! this.options.plugins.length) return;
            for (var i = 0, ii = datas.length; i < ii; i++) {
                for (var name in datas[i].plugins) {
                    datas[i].plugins[name].onSuspend();
                }
            }
        },
        /** @private */
        _isvalid: function(data, type, dest) {
            var fields = this.options.fields;

            if (this.isphantom(dest)) {
                this._error(type + "(): destination doesn't exists!");
                return false;
            }

            if (dest[fields.id] == data[fields.id]) {
                this._error(type + "(): can't move to itself!");
                return false;
            }

            if (this.isdescendant(data, dest)) {
                this._error(type + "(): can't move to descendant!");
                return false;
            }

            switch(type) {
                case 'before':
                    if (
                        this.index(dest) - this.descendants(data).length - 1 == this.index(data) && 
                        data[fields.level] == dest[fields.level] && 
                        ! this.isphantom(data)
                    ){
                        this._error("before(): nothing to move!");
                        return false;
                    }
                break;

                case 'after':
                    if (
                        this.index(dest) + this.descendants(dest).length + 1 == this.index(data) && 
                        data[fields.level] == dest[fields.level] && 
                        ! this.isphantom(data)
                    ){
                        this._error("after(): nothing to move!");
                        return false;
                    }

                break;

                case 'append':
                    var child = dest._child || [];

                    if (child[child.length - 1] == data[fields.id] && ! this.isphantom(data)) {
                        this._error("append(): nothing to move!");
                        return false;
                    }

                    if ( ! this.isexpanded(dest)) {
                        this._error("append(): can't append to collapsed data!");
                        return false; 
                    }
                break;
            }

            return true;
        },
        /** @private */
        _detach: function(data, descs) {
            var 
                fields = this.options.fields,
                offset = this.index(data),
                size = descs.length;

            if (offset > -1) {
                data._origin = null;
                var 
                    owner = data._parent || null, 
                    regex = new RegExp('.*(?='+(owner ? '/' : '')+data[fields.id]+'/?)'),
                    retrm = new RegExp('^/');
                    level = +data[fields.level];

                if (owner) {
                    owner._child = owner._child || [];
                    var cindex = indexof(owner._child, data[fields.id]);
                    if (cindex > -1) {
                        owner._child.splice(cindex, 1);
                        if ( ! owner._child.length) {
                            owner[fields.leaf] = '1';
                        }
                    }
                    data._origin = owner;
                } else {
                    var prev = this.prev(data);
                    if (prev) data._origin = prev; 
                }

                this._data.splice(offset, 1);
                delete this._indexes[data[fields.id]];

                data._parent = null;
                data._root   = null;

                data[fields.level] = 0;
                data[fields.path]  = data[fields.path].replace(regex, '').replace(retrm, '');

                if (size) {
                    this._data.splice(offset, size);
                    for (var i = 0; i < size; i++) {
                        descs[i]._root = null;
                        
                        descs[i][fields.path]  = descs[i][fields.path].replace(regex, '').replace(retrm, '');
                        descs[i][fields.level] = +descs[i][fields.level] - level;

                        delete this._indexes[descs[i][fields.id]];
                    }
                }

                regex = null;
                retrm = null;

                this._reindex(offset);
            }
        },
        /** @private */
        _attach: function(data, descs, type, dest) {
            var 
                fields = this.options.fields,
                dsize = descs.length,
                offset = -1,
                prefix = '',
                bindex = 0,
                level = 0,
                owner = null,
                root = null,
                pos = 0,
                i;

            // define offset
            switch(type) {
                case 'after':
                    offset = this.index(dest);
                    level = +dest[fields.level];
                    owner = dest._parent;
                    root = dest._root;
                    pos = +dest[fields.left] + this.size(dest);

                    if (owner) {
                        prefix = owner[fields.path] + '/';
                        bindex = this.index(owner);
                    } else {
                        bindex = offset;
                    }

                    offset += this.descendants(dest).length + 1;

                    break;

                case 'before':
                    offset = this.index(dest);
                    level = +dest[fields.level];
                    owner = dest._parent;
                    root = dest._root;
                    pos = +dest[fields.left];

                    if (owner) {
                        prefix = owner[fields.path] + '/';
                        bindex = this.index(owner);
                    }

                    break;

                case 'append':
                    prefix = dest[fields.path] + '/';
                    offset = this.index(dest);
                    level = +dest[fields.level] + 1;
                    root = dest._root;
                    pos = +dest[fields.right];

                    bindex = offset;
                    offset += this.descendants(dest).length + 1;

                    if (dest[fields.leaf] == '1') {
                        dest[fields.leaf] = '0';
                    }

                    break;
            }

            if (offset > -1) {

                this._data.splice(offset, 0, data);

                data._root = root;
                data[fields.level] = level;
                data[fields.path] = prefix + data[fields.path];

                if (dsize) {
                    Array.prototype.splice.apply(this._data, [(offset + 1), 0].concat(descs));
                    for (i = 0; i < dsize; i++) {
                        descs[i][fields.level] = +descs[i][fields.level] + level;
                        descs[i][fields.path]  = prefix + descs[i][fields.path];
                    }
                }
                
                this._reindex(offset);

                var origin, oidx;

                if ((origin = data._origin)) {
                    oidx = this.index(origin);
                    if (oidx < bindex) bindex = oidx;
                    delete data._origin;
                }

                // update like SQL
                var 
                    p = pos,
                    l = +data[fields.left],
                    r = +data[fields.right],
                    j = this._data.length,
                    d,
                    x,
                    y;

                for (i = 0; i < j; i++) {
                    d = this._data[i];

                    x = +d[fields.left];
                    y = +d[fields.right];

                    if (r < p || p < l) {

                        if (p > r) {
                            if (r < x && x < p) {
                                x += l - r - 1;
                            } else if (l <= x && x < r) {
                                x += p - r - 1;
                            } else {
                                x += 0;
                            }

                            if (r < y && y < p) {
                                y += l - r - 1;
                            } else if (l < y && y <= r) {
                                y += p - r - 1;
                            } else {
                                y += 0;
                            }
                        } else {
                            if (p <= x && x < l) {
                                x += r - l + 1;
                            } else if (l <= x && x < r) {
                                x += p - l;
                            } else {
                                x += 0;
                            }

                            if (p <= y && y < l) {
                                y += r - l + 1;
                            } else if (l < y && y <= r) {
                                y += p - l;
                            } else {
                                y += 0;
                            }
                        }

                        d[fields.left]  = x;
                        d[fields.right] = y;

                    }

                    if (i >= bindex) {
                        // reset child but keep parent
                        if (d._parent) {
                            d._parent._child = [];
                        }    
                    }

                }
                // rebuild...
                this._rebuild(bindex);
            }
        },
        _insert: function(data, type, dest) {
            var fields = this.options.fields;
            var level, index, child, chpos, pos, d;

            switch(type) {
                case 'append':
                    data._last   = true;
                    data._root   = dest._root;
                    data._parent = dest;

                    dest[fields.leaf] = 0;
                    data[fields.path] = dest[fields.path] + '/' + data[fields.id];
                    data[fields.level] = +dest[fields.level] + 1;

                    dest._child = dest._child || [];

                    if (dest._child.length) {
                        index = this.index(this.get(dest._child[dest._child.length - 1])) + 1;
                    } else {
                        index = this.index(dest) + 1;
                    }

                    dest._child.push(data);
                    pos = +dest[fields.right];
                    
                    break;
                case 'before':

                    data[fields.left] = dest[fields.left];
                    data[fields.right] = dest[fields.right];
                    data[fields.level] = dest[fields.level];

                    data._last = false;
                    data._root = dest._root;
                    data._parent = dest._parent;

                    index = this.index(dest);
                    pos   = this.left(dest);

                    if (data._parent) {
                        child  = data._parent._child || [];
                        chpos = indexof(child, dest[fields.id]);
                        chpos = chpos < -1 ? 0 : chpos;
                        child.splice(chpos, 0, data);

                        data[fields.path] = data._parent[fields.path] + '/' + data[fields.id];
                    } else {
                        data[fields.path] = data[fields.id];
                    }

                    break;
                case 'after':
                    break;
            }

            // create new space for subtree
            for (var i = 0, ii = this._data.length; i < ii; i++) {
                d = this._data[i];
                if (d[fields.left] >= pos) {
                    d[fields.left] = +d[fields.left] + 2;
                }
                if (d[fields.right] >= pos) {
                    d[fields.right] = +d[fields.right] + 2;
                }
            }

            data[fields.left]  = pos;
            data[fields.right] = pos + 1;

            data._metachanged = true;

            this._data.splice(index, 0, data);

            this._reindex();
            this._rebuild(); // TODO: check offset...

        },
        /** @private */
        _startEdit: function(node) {
            var 
                data = this._data[this._indexes[node.attr('data-id')]],
                fields = this.options.fields,
                holder = node.find('.bt-text'),
                text = data[fields.text];

            // remove query hightlight
            if (data._orig && data._orig.text) {
                text = data._orig.text;
            }

            // drop previous editing
            this._stopEdit(true);

            // ensure selection
            this.select(node);

            // place editor
            this.editor.appendTo(holder);
            this.edtext.val(text).focus();

            // defer text select
            var defer = $.debounce(1, function(){
                seltext(this.edtext, text.length);
            });

            defer.call(this);
        },
        /** @private */
        _stopEdit: function(deselect) {
            var 
                fields = this.options.fields,
                node = this.editor.closest('.bt-node');
                
            if (node.length) {
                var 
                    data = this._data[this._indexes[node.attr('data-id')]],
                    text = this.edtext.val(),
                    orig = data[fields.text],
                    disp = text;

                if (data._orig && data._orig.text) {
                    orig = data._orig.text;
                    disp = data._orig.disp;
                }

                data[fields.text] = disp;
                deselect = deselect === undef ? true : deselect;
                
                if (deselect) {
                    this.deselect(node);
                    // remove editor
                    this.editor.detach();
                    node.find('.bt-text').html(disp);
                }

                if (text != orig) {
                    this._fireEvent('edit', data, text);
                }
            } else {
                // manual deselect...
                this._selected = null;
                this.grid.find('.bt-selected').removeClass('bt-selected');
            }
        },
        /** @private */
        _fireEvent: function() {
            var args = $.makeArray(arguments),
                name = (args.shift()) + '.bt';
            this.element.trigger(name, args);
        },
        hasScroll: function() {
            return this.element[0].scrollHeight > this.element.height();
        },
        load: function(data, render) {
            var 
                fields = this.options.fields,
                start = this._data.length,
                stop;

            this._data.push.apply(this._data, (data || []));
            stop = this._data.length;

            this._reindex(start, stop);
            this._rebuild(start, stop);

            render = render === undef ? false : render;
            render && this.render();
        },
        render: function() {
            var 
                buff = this.options.buffer * this.options.itemSize,
                spix = this.grid.scrollTop() - this.grid.position().top - buff,
                epix = spix + buff + this.element.height() + buff,
                data = $.grep(this._data, function(d){ return !d._hidden; });
            
            spix = spix < 0 ? 0 : spix;
            epix = epix < 0 ? 0 : epix;

            var 
                begidx = Math.floor(spix / this.options.itemSize),
                endidx = Math.ceil(epix / this.options.itemSize),
                padtop = this.options.itemSize * begidx,
                padbtm = this.options.itemSize * data.slice(endidx).length;

            this.grid.css({
                paddingTop: padtop,
                paddingBottom: padbtm
            });

            this._renderRange(data, begidx, endidx);
        },
        scroll: function(data) {
            var 
                options = this.options,
                stacks  = $.grep(this._data, function(d){ return ! d._hidden; }),
                scroll  = indexof(stacks, data) * options.itemSize,
                element = this.element;

            element.animate({scrollTop: scroll}, scroll);
        },
        visible: function() {
            return this._visible;
        },
        create: function(spec) {
            if ( ! spec) {
                this._error("create(): spec doesn't meet requirement!");
                return false;
            }

            // setup structure
            var fields = this.options.fields,
                guid = this._guid(),
                prop,
                key;

            for (prop in fields) {
                key = fields[prop];
                if (spec[key] === undef) {
                    switch(prop) {
                        case 'id':
                            spec[key] = guid;
                            break;
                        case 'leaf':
                        case 'expand':
                            spec[key] = 1;
                            break;
                        default:
                            spec[key] = '';
                    }
                }
            }

            // setup metadata
            spec._hidden = false;
            
            var 
                owner = this.selection(),
                first = this.first(),
                result = true;

            if (owner) {
                result = this.append(owner, spec);
            } else if (first) {
                result = this.before(first, spec);
            } else {
                spec[fields.left]  = 1;
                spec[fields.right] = 2;
                spec._root = null;
                spec._parent = null;
                spec._last = true;

                this._data.unshift(spec);

                this._reindex();
                this._rebuild();
                this.render();

                render = true;
                result = true;
            }

            this._debug();
            return result;
        },
        remove: function(data, cascade) {
            if (data) {
                var
                    fields = this.options.fields,
                    offset = this.index(data),
                    node = this.nodeof(data);

                cascade = cascade === undef ? true : cascade;

                if (cascade) {
                    var 
                        removed = this.descendants(data), 
                        owner = data._parent,
                        prev = this.prev(data),
                        size,
                        key;

                    removed.unshift(data);
                    size = removed.length;

                    for (var i = 0; i < size; i++) 
                        delete this._indexes[removed[i][fields.id]];

                    this._data.splice(offset, size);
                    this._reindex(offset);

                    if (owner) {
                        owner._child = owner._child || [];
                        var chpos = indexof(owner._child, data[fields.id]);
                        if (chpos > -1) {
                            owner._child.splice(chpos, 1);
                            if ( ! owner._child.length) {
                                owner[fields.leaf] = '1';
                            }
                        }
                        this._rebuild(this.index(owner));
                    } else {
                        if (prev) {
                            this._rebuild(this.index(prev));
                        } else {
                            this._rebuild(offset);    
                        }
                    }

                    if (node.length) this.render();
                }
                return true;
            }
            return false;
        },
        update: function(data, spec) {
            data = data || {};
            spec = spec || {};
        },
        append: function(owner, data) {
            if (this._isvalid(data, 'append', owner)) {
                var node = this.nodeof(owner), desc;
                if (this.isphantom(data)) {
                    this._insert(data, 'append', owner);
                } else {
                    desc = this.descendants(data);
                    this._detach(data, desc);
                    this._attach(data, desc, 'append', owner);
                }
                if (node.length) this.render();
                return true;
            }
            return false;
        },
        before: function(next, data) {
            if (this._isvalid(data, 'before', next)) {
                var node = this.nodeof(next), desc;
                if (this.isphantom(data)) {
                    this._insert(data, 'before', next);
                } else {
                    desc = this.descendants(data);
                    this._detach(data, desc);
                    this._attach(data, desc, 'before', next);
                }

                if (node.length) this.render();
                return true;
            }
            return false;
        },
        after: function(prev, data) {
            if (this._isvalid(data, 'after', prev)) {
                var 
                    desc = this.descendants(data),
                    node = this.nodeof(prev);

                this._detach(data, desc);
                this._attach(data, desc, 'after', prev);

                if (node.length) this.render();
                return true;
            }
            return false;
        },
        get: function(key) {
            var index = this._indexes[key];
            return this._data[index] || null;
        },
        data: function(index) {
            return index !== undef ? this._data[index] : this._data;
        },
        index: function(data) {
            if (data) {
                var key = data[this.options.fields.id],
                    idx = this._indexes[key];
                return idx === undef ? -1 : idx;
            }
            return -1;
        },
        size: function(data) {
            return this.right(data) - this.left(data) + 1;
        },
        level: function(data) {
            return +data[this.options.fields.level];
        },
        left: function(data) {
            return +data[this.options.fields.left];
        },
        right: function(data) {
            return +data[this.options.fields.right];
        },
        isphantom: function(data) {
            return this.index(data) === -1;
        },
        isleaf: function(data) {
            return this.right(data) - this.left(data) === 1;
        },
        isparent: function(data) {
            return ! this.isleaf(data);
        },
        isancestor: function(data, target) {
            return this.left(data) > this.left(target) && this.right(data) < this.right(target);
        },
        isdescendant: function(data, target) {
            return this.left(target) > this.left(data) && this.right(target) < this.right(data);
        },
        isexpanded: function(data) {
            return +data[this.options.fields.expand] === 1;
        },
        iscollapsed: function(data) {
            return ! this.isexpanded(data);
        },
        isvisible: function(data) {
            var stacks = this.visible();
            return indexof(stacks, data) > -1;
        },
        first: function() {
            return this._data[0];
        },
        last: function() {
            return this._data[this._data.length - 1];
        },
        parent: function(data) {
            return data._parent;
        },
        prev: function(data) {
            var 
                fields = this.options.fields,
                owner = data._parent,
                found = null,
                index;

            if (owner) {
                var child = owner._child || [];
                index = this._indexes[child[indexof(child, data[fields.id]) - 1]];
                found = this.data(index);
            } else {
                var prev, plvl, dlvl;

                index = this.index(data);
                dlvl  = this.level(data);
                prev  = this._data[--index];

                while(prev && (plvl = +prev[fields.level]) >= dlvl) {
                    if (plvl === dlvl) {
                        found = prev;
                        break;
                    }
                    prev  = this._data[--index];
                }
            }

            return found || null;
        },
        next: function(data) {
            var 
                fields = this.options.fields, 
                owner = data._parent, 
                found = null,
                index;

            if (owner) {
                var child = owner._child || [];
                index = this._indexes[child[indexof(child, data[fields.id]) + 1]];
                found = this.data(index);
            } else {
                var next, dlvl, nlvl;

                index = this.index(data);
                dlvl  = this.level(data);
                next  = this._data[++index];

                while(next && (nlvl = +next[fields.level]) >= dlvl) {
                    if (nlvl === dlvl) {
                        found = next;
                        break;
                    }
                    next  = this._data[++index];
                }
            }
            return found;
        },
        descendants: function(data) {
            var 
                fields = this.options.fields,
                start = this._indexes[data[fields.id]],
                next = this._data[++start],
                desc = [],
                rgt = +data[fields.right];

            while(next) {
                if (+next[fields.right] >= rgt) 
                    break;
                desc.push(next);
                next = this._data[++start];
            }
            return desc;
        },
        children: function(data) {
            var 
                child = data._child || [],
                len = child.length,
                arr = [];

            for (var i = 0; i < len; i++) {
                var idx = this._indexes[child[i]],
                    row = this._data[idx];
                if (row) {
                    arr.push(row);
                }
            }

            return arr;
        },
        createNode: function(data) {
            return $($.templates.btnode(data));
        },
        nodeof: function(data) {
            return this.grid.children('.bt-node[data-id='+(data[this.options.fields.id])+']');
        },
        movedNode: function() {
            return this.grid.children('.ui-sortable-helper');
        },
        visibleNodes: function() {
            return this.grid.children('.bt-node:not(.ui-sortable-placeholder)');
        },
        removableNodes: function() {
            return this.grid.children().not('.ui-sortable-helper,.ui-sortable-placeholder');
        },
        selectedNode: function() {
            var node = $({});
            if (this._selected) {
                node = this.grid.children('.bt-node[data-id=' + this._selected + ']');
            }
            return node.length ? node : null;
        },
        dataof: function(node) {
            var key = node.attr('data-id');
            return this._data[this._indexes[key]];
        },
        cascade: function(data, handler, scope) {
            var desc = this.descendants(data) || [];
            desc.unshift(data);
            scope = scope || this;
            $.each(desc, function(i, d){
                $.proxy(handler, scope, d)();
            });
        },
        expand: function(data) {
            var 
                fields = this.options.fields,
                fshow = function(data) {
                    var ds = this.children(data),
                        dz = ds.length;
                    for (var i = 0; i < dz; i++) {
                        ds[i]._hidden = false;
                        if (ds[i]._child !== undef && ds[i][fields.expand] == '1') {
                            fshow.call(this, ds[i]);
                        }
                    }    
                };

            data[fields.expand] = '1';
            data._metachanged = true;

            fshow.call(this, data);

            this._fireEvent('expand', data);
            this.render();
        },
        collapse: function(data) {
            var 
                fields = this.options.fields,
                fhide = function(data) {
                    var ds = this.children(data),
                        dz = ds.length;
                    for (var i = 0; i < dz; i++) {
                        ds[i]._hidden = true;
                        if (ds[i]._child !== undef && ds[i][fields.expand] == '1') {
                            fhide.call(this, ds[i]);
                        }
                    }     
                };

            data[fields.expand] = '0'; 
            data._metachanged = true;

            fhide.call(this, data);

            this._fireEvent('collapse', data);
            this.render();
        },
        toggle: function(node, silent, force) {
            var expander = node.find('.elbow-expander');
            silent = silent === undef ? true : silent;
            if (expander.length) {
                if (silent) {
                    // just update style
                    var state = expander.hasClass('elbow-plus') ? 'elbow-minus' : 'elbow-plus';
                    if (force !== undef) {
                        state = force == 'expand' ? 'elbow-minus' : 'elbow-plus';
                    }
                    expander.removeClass('elbow-plus elbow-minus').addClass(state); 
                } else {
                    // perform expand/collapse
                }
            }
        },
        select: function(node, single) {
            single = single === undef ? true : single;
            if (single) this.deselectAll();

            this._selected = node.attr('data-id');
            node.addClass('bt-selected');
        },
        deselect: function(node) {
            this._selected = null;
            node.removeClass('bt-selected');
        },
        deselectAll: function() {
            this._selected = null;
            this.grid.children('.bt-selected').removeClass('bt-selected');
            this.editor.detach();
        },
        selection: function() {
            var node = this.grid.children('.bt-selected');
            return node.length ? this._data[this._indexes[this._selected]] : null;
        },
        query: function(query) {

            var 
                fields = this.options.fields,
                regex = new RegExp('('+query+')', 'igm'),
                size = this._data.length,
                text,
                data,
                disp,
                i;

            for (i = 0; i < size; i++) {

                data  = this._data[i];

                // reset first
                if (data._orig) {
                    data._hidden = data._orig.hidden;
                    
                    data[fields.expand] = data._orig.expand;
                    data[fields.text] = data._orig.text;

                    delete data._orig;
                }

                if (query) {
                    text = data[fields.text];

                    data._orig = {
                        hidden: data._hidden,
                        expand: data[fields.expand],
                        text: text
                    };

                    var found = regex.exec(text);

                    data._hidden = true;

                    if (found) {

                        disp = data[fields.text].replace(
                            found[1], 
                            '<span class="bt-hightlight">'+found[1]+'</span>'
                        );

                        data._hidden = false;
                        data._orig.disp = disp;
                        data[fields.text] = disp;

                        var pdat = data._parent;

                        while(pdat) {
                            if (pdat._hidden) {
                                pdat._hidden = false;
                            }
                            pdat[fields.expand] = '1';
                            pdat = pdat._parent;
                        }
                    }
                }

            }

            regex = null;
            this.render();
        },
        swap: function(from, to, reindex) {
            var size = this._data.length, tmp, i;
            if (from != to && from >= 0 && from <= size && to >= 0 && to <= size) {
                tmp = this._data[from];
                if (from < to) {
                    for (i = from; i < to; i++) {
                        this._data[i] = this._data[i+1];
                    }
                } else {
                    for (i = from; i > to; i--) {
                        this._data[i] = this._data[i-1];
                    }
                }

                this._data[to] = tmp;

                reindex = reindex === undef ? true : reindex;
                if (reindex) this._reindex();
            }
        },
        instance: function() {
            return this;
        },
        tickStart: function(name) {
            this.markers = this.markers || {};
            name = name === undef ? '_' : name;
            this.markers[name] = new Date();
        },
        tickStop: function(name) {
            this.markers = this.markers || {};
            name = name === undef ? '_' : name;
            if (this.markers[name] !== undef) {
                var elapsed = ((new Date() - this.markers[name]) / 1000) + 'ms';
                console.log(name + ': ' + elapsed);
            }
        },
        _onScroll: function(e) {
            var 
                options = this.options,
                currtop = this.element.scrollTop(),
                currdir = currtop > this._scrolltop ? 'down' : 'up',
                buffzone,
                trigger = false;

            if (currdir == this._scrolldir) {
                this._scrolldif = this._scrolldif + Math.abs(currtop - this._scrolltop);
            } else {
                trigger = true;
                this._scrolldif = 0;
            }

            buffzone = (options.buffer * options.itemSize - this._buffedge);

            if (this._scrolldir == '' || this._scrolldif >= buffzone) {
                trigger = true;
            }

            if (trigger) {
                this._scrolldif = 0;
                this.render();
            }

            this._scrolltop = currtop;
            this._scrolldir = currdir;
        },
        _onExpanderClick: function(e) {
            e.stopPropagation();
            var 
                node = $(e.currentTarget).closest('.bt-node'),
                data = this.get(node.attr('data-id'));

            if (data) {
                if (this.isexpanded(data)) {
                    this.collapse(data);
                } else {
                    this.expand(data);
                }
            }
        },
        _onNavigate: function(e) {
            var code = e.keyCode || e.which;
            if (code == 9 || code == 38 || code == 40) {
                var 
                    node = this.grid.find('.bt-selected'),
                    next,
                    prev;

                e.preventDefault();

                if (node.length) {

                    switch(code) {
                        // tab
                        case 9:
                            var method = e.shiftKey ? 'prev' : 'next',
                                target = node[method].call(node);
                            if (target.length) this._startEdit(target);
                            break;
                        // up
                        case 38:
                            prev = node.prev('.bt-node');
                            if (prev.length) this._startEdit(prev);
                            break;
                        // down
                        case 40:
                            next = node.next('.bt-node');
                            if (next.length) this._startEdit(next);
                            break;

                    }    
                }
            }
        },
        _onBeforeDrag: function(e, ui) {
            var 
                fields = this.options.fields,
                node = ui.item,
                data = this.dataof(node);

            this.deselectAll();
            this.select(node);

            node.addClass('bt-moving');

            if (data) {
                var 
                    isexpand = +data[fields.expand] === 1,
                    desc = this.descendants(data),
                    size = desc.length,
                    attr;

                if (size) {
                    this.toggle(node, true, 'collapse');
                    attr = desc.map(function(d){return '.bt-node[data-id='+d[fields.id]+']';}).join(',');
                    this.grid.children(attr).remove();
                }

            }
        },
        _onAfterDrag: function(e, ui) {
            var 
                options = this.options,
                indexes = this._indexes,
                fields = options.fields,
                stacks = this._data,
                node = ui.item,
                offset = ui.position.left,
                data = this.dataof(node),
                prev = node.prev('.bt-node'),
                next = node.next('.bt-node');

            var lookup = function(current, start, level) {
                var 
                    siblings = [],
                    target = level - 1,
                    look = stacks[start],
                    curr;

                target = target < 0 ? 0 : target;

                while(look) {
                    curr = +look[fields.level];
                    if (curr === level) siblings.push(look);
                    if (curr === target) break;
                    look = stacks[--start];
                }
                
                if (siblings.length) {
                    return ['after', siblings[siblings.length - 1], current];
                } else {
                    return ['append', look, current];    
                }
            };

            node.removeClass('bt-moving');
            
            // define level
            var 
                dataLevel = +data[fields.level],
                dragLevel = 0,
                tolerance = 5,
                args = [];

            offset = offset - options.guttSize;

            if (offset + tolerance < -options.dragSize) {
                dragLevel = dataLevel - (Math.round(Math.abs(offset) / options.stepSize));
            } else if (offset > options.dragSize) {
                dragLevel = dataLevel + (Math.round(offset / options.stepSize));
            } else {
                dragLevel = dataLevel;
            }

            dragLevel = dragLevel < 0 ? 0 : dragLevel;

            if (prev.length) {
                var 
                    prevData = this.dataof(prev),
                    prevLevel = this.level(prevData),
                    prevIndex = this.index(prevData),
                    prevChild = prevData._child || [];

                if (dragLevel > prevLevel) {
                    if (prevChild.length) {
                        if ( ! this.isexpanded(prevData)) {
                            args = ['after', prevData, data];
                        } else {
                            args = ['before', this.get(prevChild[0]), data];    
                        }
                    } else {
                        args = ['append', prevData, data];
                    }
                } else if (dragLevel === prevLevel) {
                    args = ['after', prevData, data];
                } else {
                    args = lookup(data, prevIndex, dragLevel);
                }
            } else if (next.length) {
                var nextData = this.dataof(next);
                args = ['before', nextData, data];
            } else {
                this._error('move(): nothing to move!');
            }

            if (args.length) {
                var action = args.shift(),
                    result = this[action].apply(this, args);
                
                if (result) {
                    if ( ! this.isvisible(data)) this.scroll(data);
                } else {
                    this._debug();
                }
            } else {
                this._debug();
            }
        },
        _error: function(message) {
            this._message = message;
        },
        _debug: function(message) {
            if (this.options.debug) {
                message = message === undef ? this._message : message;
                console.log(message);    
            }
        },
        destroy: function(remove) {
            this.edtext.off('.bt');
            this.element.off('.bt');
            this.element.sortable('destroy');
            
            $.removeData(this.element[0], 'bigtree');

            this._data = null;
            this._indexes = null;
            this._selected = null;

            if (remove !== undef && remove === true) {
                this.editor.remove();
                this.element.remove();
            }
        }
    };

    $.fn.bigtree = function(options) {
        var 
            args = $.makeArray(arguments),
            init = $.type(args[0]) !== 'string',
            list,
            func;

        list = this.each(function(){
            var obj = $.data(this, 'bigtree');
            
            if ( ! obj) {
                $.data(this, 'bigtree', (obj = new BigTree(this, options)));
            }

            if ( ! init) {
                var method = args.shift();
                if ($.isFunction(obj[method])) {
                    func = obj[method].apply(obj, args);    
                } else {
                    throw Error(method + ' is not function!');
                }
            }
        });

        return init ? list : func;
    };

}(jQuery));
