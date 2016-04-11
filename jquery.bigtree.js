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

;(function($, undef){
    /**
     * Render constants
     */
    var RENDER_APPEND = 'append';
    var RENDER_PREPEND = 'prepend';
    
    /**
     * Direction constants
     */
    var DIR_UP = 'up';
    var DIR_DOWN = 'down';

    /**
     * Regex for text striptags
     */
    var REG_BODY = '((?:[^"\'>]|"[^"]*"|\'[^\']*\')*)';
    var REG_STRIP = new RegExp(
        '<(?:'
        + '!--(?:(?:-*[^->])*--+|-?)'
        + '|script\\b' + REG_BODY + '>[\\s\\S]*?</script\\s*'
        + '|style\\b' + REG_BODY + '>[\\s\\S]*?</style\\s*'
        + '|/?[a-z]'
        + REG_BODY
        + ')>',
        'gi'
    );

    /**
     * Template counter
     */
    var template = 0;
    
    /**
     * Internal helper
     */
    var _h = {
        prototypeof: function (object) {
            if (Object.getPrototypeOf === 'function') {
                return Object.getPrototypeOf(object);
            }
            return object.__proto__ === 'object' 
                ? object.__proto__ 
                : object.constructor.prototype;
        },
        indexof: function (array, item) {
            var len = array.length, i = 0;
            while(i < len) {
                if (array[i] === item) {
                    return i;
                }
                i++;
            }
            return -1;
        },
        firstof: function (array) {
            return (array || [])[0];
        },
        lastof: function (array) {
            array = array || [];
            return array[array.length - 1];
        },
        seltext: function (input, beg, end) {
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
        },
        transend: function() {
            return 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
        },
        sanitize: function(text) {
            var old;
            do {
                old = text;
                text = text.replace(REG_STRIP, '');
            } while (text != old);
            return text.replace(/</g, '&lt;');
        }
    };
    
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
        delay: 60,

        // leading & trailing rendered nodes
        buffer: 10,

        // node markup, can contains templating tags supported by jsRender
        markup: '<div data-id="{{:id}}" class="bt-node bt-hbox">'+
                    '<div class="bt-node-body bt-flex bt-hbox">'+
                        '<div class="bt-drag"></div>'+
                        '<div class="bt-plugin head bt-hbox"></div>'+
                        '<div class="bt-text bt-flex bt-hbox">{{:text}}</div>'+
                        '<div class="bt-plugin tail bt-hbox"></div>'+
                    '</div>'+
                '</div>',

        masker: '<div class="bt-mask spinner-loading">'+ 
                    '<div class="spinner">'+ 
                        '<div class="rect1"></div>'+ 
                        '<div class="rect2"></div>'+  
                        '<div class="rect3"></div>'+  
                        '<div class="rect4"></div>'+  
                        '<div class="rect5"></div>'+ 
                    '</div>'+ 
                '</div>',

        plugins: [],
        helpers: {},
        safeMode: false,
        debug: true
    };

    /**
     * Prototype
     */
    BigTree.prototype = {
        init: function (options) {

            this.options = $.extend(true, {}, BigTree.defaults, options || {});

            if (this.options.safeMode) {
                this.options.plugins = [];
            }

            this._buffer = this.options.itemSize * this.options.buffer;
            this._edges  = Math.floor(this._buffer / 2);

            this._data = [];
            this._indexes = {};

            this._ranges = [0, 0];
            this._visible = [];
            this._message = '';

            this._helpers = {};

            this._initComponent();
            this._initEvents();

            this.fire('init');

        },
        /** @private */
        _initComponent: function () {
            var options = this.options, fields = options.fields;

            this.element.addClass('bigtree').attr('tabindex', 1);

            this.editor = $('<div class="bt-editor"><input type="text"></div>');
            this.input  = this.editor.children('input');
            this.grid   = $('<div class="bt-grid">').appendTo(this.element);
            // this.grid.addClass('test');
            
            this.masker = $(this.options.masker);
            
            // setup template
            this._setupTemplate();

            // init sortable
            this.element.sortable({
                items: '.bt-node',
                handle: '.bt-drag',
                placeholder: 'bt-node-sortable ui-sortable-placeholder'
            });

            // force scroll to top
            this.grid.css({paddingTop: 0, paddingBottom: 0});
        },
        /** @private */
        _initEvents: function () {
            this._lastscr = this.element.scrollTop();
            this._lastdir = '';
            this._lastdif = 0;

            // unbinds
            this.element.off(
                'scroll.bt.delay '+
                'click.bt.expander '+
                'keydown.bt '+
                'click.bt.select '+
                'click.bt.startedit');

            this.input.off('click.bt keypress.bt');

            this.element.on({
                'scroll.bt.delay': $.debounce(this.options.delay, $.proxy(this._onDelayedScroll, this)),
                'keydown.bt': $.proxy(this._onNavigate, this),
                'sortstart.bt': $.proxy(this._onBeforeDrag, this),
                'sortstop.bt': $.proxy(this._onAfterDrag, this),
                'click.bt.select': $.proxy(function (){ 
                    this.deselectAll(); 
                    this._stopEdit();
                }, this)
            });

            this.element.on('click.bt.expander', '.elbow-expander', $.proxy(this._onExpanderClick, this));
            
            this.element.on('click.bt.startedit', '.bt-text', $.proxy(function (e){
                e.stopPropagation();
                var node = $(e.currentTarget).closest('.bt-node');
                this._startEdit(node);
            }, this));

            this.input.on({
                'click.bt': function (e){
                    e.stopPropagation();
                },
                'keypress.bt': $.proxy(function (e){
                    if (e.keyCode === 13) {
                        this._stopEdit(false);
                    }
                }, this)
            });
        },
        /** @private */
        _setupTemplate: function () {
            var 
                plugins = this.options.plugins,
                markup = $(this.options.markup),
                style = markup.attr('class') || '';

            markup.attr('data-number', '{{:_number}}').prepend('{{:_elbows}}');
            markup.attr('class', style + ' {{if _last}} bt-last{{/if}}{{if _match}} bt-match{{/if}} ');

            var 
                head = markup.find('.bt-plugin.head'),
                tail = markup.find('.bt-plugin.tail');

            var regex = new RegExp('({[^{]+)this.', 'g');

            $.each(plugins, $.proxy(function (i, p){
                if (p.template) {
                    
                    var proto = _h.prototypeof(p);
                    
                    if (proto.update === undef) {
                        $.extend(proto, {update: $.noop});
                    }

                    if (proto.onInit === undef) {
                        $.extend(proto, {onInit: $.noop});
                    }

                    if (proto.onSuspend === undef) {
                        $.extend(proto, {onSuspend: $.noop});
                    }

                    if (proto.onRender === undef) {
                        $.extend(proto, {onRender: $.noop});
                    }

                    p.id = p.id === undef ? i : p.id;
                    // we need to replace some placeholder
                    p.templateString = p.template; // save orig
                    p.template = p.template.replace(regex, '$1__' + p.id + '__');
                    // console.log(p.template);
                    var prop, key;

                    $.extend(true, this._helpers, this.options.helpers);

                    for (prop in p) {
                        if (p.hasOwnProperty(prop)) {
                            if ($.type(p[prop]) === 'function') {
                                key = '__' + p.id + '__' + prop;
                                this._helpers[key] = p[prop];
                            }
                        }
                    }

                    $(p.template).attr('data-plugin-id', p.id).appendTo(p.place == 'tail' ? tail : head);
                }    
            }, this));

            markup = $('<div>').append(markup).remove().html();
            regex  = null;

            $.templates('btnode_' + (++template), markup);
        },

        /** @private */
        _reindex: function (start, stop) {
            var fields = this.options.fields, i;
            
            start = start === undef ? 0 : start;
            stop  = stop  === undef ? this._data.length : stop;

            for (i = start; i < stop; i++)  {
                this._indexes[this._data[i][fields.id]] = i;
            }
        },
        /** @private */
        _rebuild: function (start, stop) {
            var fields = this.options.fields, root = null, i;
            
            start = start === undef ? 0 : start;
            stop  = stop  === undef ? this._data.length : stop;

            if (start > 0 && this._data[start]) {
                root  = this._data[start]._root || null;
            }

            for (i = start; i < stop; i++) {
                var cur = this._data[i];

                // actualy prepare for metadata
                cur._elbows = '';
                cur._level  = 0;
                cur._editing = false;

                // render number
                cur._number = -1;

                if (+cur[fields.level] === 0) {
                    if (root) {
                        root._last = false;
                    }
                    
                    cur._root   = null;
                    cur._parent = null;
                    cur._last   = true;
                    cur._hidden = false;
                    cur._match  = false;

                    root = cur;
                } else  {
                    var pid = cur[fields.path].split('/'), par, chd;

                    pid.pop();
                    pid = pid.pop();

                    par = this._data[this._indexes[pid]];

                    if ( ! par) {
                        throw new Error("Parent not found, invalid tree structure");
                    }

                    par._child = par._child || [];
                    chd = this._data[this._indexes[_h.lastof(par._child)]];

                    if (chd) chd._last = false;
                    

                    cur._root   = root;
                    cur._parent = par;
                    cur._last   = true;
                    cur._hidden = +par[fields.expand] === 0 || par._hidden;

                    cur._match  = false;

                    par._child.push(cur[fields.id]);
                }

                cur._metachanged = true;
                
            }
        },
        /** @private */
        _renderRange: function (stacks, start, end, type, cleanup) {
            var 
                xvisible = this._visible,
                xranges = this._ranges,
                plugins = this.options.plugins,
                fields = this.options.fields,
                range = stacks.slice(start, end),
                moved = this.movedNode(),
                psize = plugins.length;

            if (moved.length) {
                range = $.grep(range, function (d){
                    return d[fields.id] != moved.attr('data-id');
                });
            }

            var suspend = [], remove = [], render = [];

            // prepare suspend
            if (cleanup) {
                remove = this.removableNodes();
                suspend = xvisible;
            } else {
                var dispose = [];
                remove = this.removableNodes().filter(function(){
                    var node = $(this), num = +node.attr('data-number');
                    if ((type == RENDER_APPEND && num < start) || (type == RENDER_PREPEND && num >= end)) {
                        dispose.push(node.attr('data-id'));
                        return true;
                    }
                });
                suspend = $.grep(xvisible, function(v){
                    return _h.indexof(dispose, v[fields.id]) > -1;
                });
            }
            
            this._suspendPlugins(suspend);
            this.editor.detach();
            
            this._ranges  = [start, end];
            this._visible = range;

            var rsize = range.length, data, pick, i, j, k, p;

            // prepare render
            for (i = 0; i < rsize; i++) {
                data = range[i];
                pick = false;

                // reset editor
                data._editing = false;

                // assign number;
                data._number = (start + i);

                if ((type == RENDER_APPEND && data._number >= xranges[1]) || 
                        (type == RENDER_PREPEND && data._number < xranges[0]) || 
                            cleanup) {
                    pick = true;
                }

                // request to render
                if (pick) {
                    render.push(data);

                    if (data._metachanged) {
                        var
                            elbows = '',
                            lines = [],
                            level = +data[fields.level],
                            owner = data._parent;

                        var icon;

                        data._metachanged = false;
                        
                        while(owner) {
                            lines[owner[fields.level]] = owner._last ? 0 : 1;
                            owner = owner._parent;
                        }

                        for (j = 0; j <= level; j++) {
                            if (j === level) {
                                icon = +data[fields.leaf] === 0 
                                    ? '<span class="elbow-expander ' + (+data[fields.expand] === 1 ? 'elbow-minus' : 'elbow-plus') + '"></span>' 
                                    : '';
                                elbows += '<div class="bt-node-elbow elbow-end">'+icon+'</div>';
                            } else {
                                elbows += '<div class="bt-node-elbow '+(lines[j] === 1 ? 'elbow-line' : '')+'"></div>';
                            }
                        }
                        data._elbows = elbows;
                    }

                    // attach plugins
                    if (data.plugins === undef) {
                        data.plugins = {};
                        for (k = 0; k < psize; k++) {
                            p = $.extend({}, plugins[k]);
                            p.onInit(this, data);
                            data.plugins[p.id] = p;
                        }
                    }
                }
            }

            this.fire('beforerender', render, suspend);

            // update plugin data
            var vsize = render.length, html;

            for (i = 0; i < vsize; i++) {
                for (j in render[i].plugins) {
                    p = render[i].plugins[j];
                    p.update();
                    this._mixdata(render[i], p);
                }
            }

            html = $.templates['btnode_'+template](render, this._helpers);

            if (cleanup) {
                remove.remove();
                this.grid.html(html);
            } else {
                if (type == RENDER_APPEND) {
                    remove.remove();    
                    this.grid.append(html);
                } else {
                    this.grid.prepend(html);
                    remove.remove();
                }    
            }
            
            if (moved.length) {
                this.element.sortable('refresh');
            } else {
                this._decorate();
            }

            this._renderPlugins(render);
            this.fire('render', render);

            suspend = null;
            remove = null;
            render = null;
        },
        /** @private */
        _decorate: $.debounce(100, function () { 
            if (this._selected) {
                var snode = this.grid.find('.bt-node[data-id='+this._selected+']');
                if (snode.length) {
                    this.select(snode);
                    this.element.focus();
                }
            }
        }),
        /** @private */
        _mixdata: function (data, plugin) {
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
        _renderPlugins: function (stacks) {
            if ( ! this.options.plugins.length) return;
            
            var fields = this.options.fields;
            var data, node, elem, name, plugin;

            for (var i = 0, ii = stacks.length; i < ii; i++) {
                data = stacks[i];
                for (name in data.plugins) {
                    plugin = data.plugins[name];
                    
                    node = this.grid.children('[data-id='+data[fields.id]+']');
                    elem = node.find('[data-plugin-id='+plugin.id+']');

                    plugin.node = node;
                    plugin.element = elem;

                    plugin.onRender();
                }
            }
        },
        
        /** @private */
        _suspendPlugins: function (stacks) {
            if ( ! this.options.plugins.length) return;
            var name, plugin;
            for (var i = 0, ii = stacks.length; i < ii; i++) {
                for (name in stacks[i].plugins) {
                    plugin = stacks[i].plugins[name];
                    plugin.onSuspend();
                    if (plugin.element) {
                        plugin.element.remove();
                        plugin.element = null;
                        plugin.node = null;
                    }
                }
            }
        },
        /** @private */
        _isvalid: function (data, action, target) {
            var fields = this.options.fields;

            if (this.isphantom(target)) {
                this._error(action + "(): target doesn't exists!");
                return false;
            }

            if (target[fields.id] == data[fields.id]) {
                this._error(action + "(): can't move to itself!");
                return false;
            }

            if (this.isdescendant(data, target)) {
                this._error(action + "(): can't move to descendant!");
                return false;
            }

            switch(action) {
                case 'before':
                    if (
                        this.index(target) - this.descendants(data).length - 1 == this.index(data) && 
                        data[fields.level] == target[fields.level] && 
                        ! this.isphantom(data)
                    ){
                        this._error("before(): nothing to move!");
                        return false;
                    }
                break;

                case 'after':
                    if (
                        this.index(target) + this.descendants(target).length + 1 == this.index(data) && 
                        data[fields.level] == target[fields.level] && 
                        ! this.isphantom(data)
                    ){
                        this._error("after(): nothing to move!");
                        return false;
                    }

                break;

                case 'append':
                    var child = target._child || [];

                    if (child[child.length - 1] == data[fields.id] && ! this.isphantom(data)) {
                        this._error("append(): nothing to move!");
                        return false;
                    }

                    if ( ! this.isexpanded(target)) {
                        this._error("append(): can't append to collapsed data!");
                        return false; 
                    }
                break;
            }

            return true;
        },
        /** @private */
        _revoke: function (data, descs) {
            var 
                fields = this.options.fields,
                offset = this.index(data),
                size = descs.length;

            data._origin = null;
            data._base = null;

            var 
                owner = data._parent || null, 
                regex = new RegExp('.*(?='+(owner ? '/' : '')+data[fields.id]+'/?)'),
                retrm = new RegExp('^/');
                level = +data[fields.level];

            if (owner) {
                owner._child = owner._child || [];
                var cindex = _h.indexof(owner._child, data[fields.id]);
                if (cindex > -1) {
                    owner._child.splice(cindex, 1);
                    if ( ! owner._child.length) {
                        owner[fields.leaf] = '1';
                    }
                }
                data._origin = owner;
                data._base = owner;
            } else {
                var prev = this.prev(data);
                if (prev) {
                    data._base = prev;
                }
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
        },
        /** @private */
        _move: function (data, descs, action, target, silent) {
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
            switch(action) {
                case 'after':
                    offset = this.index(target);
                    level = +target[fields.level];
                    owner = target._parent;
                    root = target._root;
                    pos = +target[fields.left] + this.size(target);

                    if (owner) {
                        prefix = owner[fields.path] + '/';
                        bindex = this.index(owner);
                    } else {
                        bindex = offset;
                    }

                    offset += this.descendants(target).length + 1;

                    break;

                case 'before':
                    offset = this.index(target);
                    level = +target[fields.level];
                    owner = target._parent;
                    root = target._root;
                    pos = +target[fields.left];

                    if (owner) {
                        prefix = owner[fields.path] + '/';
                        bindex = this.index(owner);
                    }

                    break;

                case 'append':
                    prefix = target[fields.path] + '/';
                    offset = this.index(target);
                    level = +target[fields.level] + 1;
                    root = target._root;
                    pos = +target[fields.right];

                    bindex = offset;
                    offset += this.descendants(target).length + 1;

                    if (target[fields.leaf] == '1') {
                        target[fields.leaf] = '0';
                    }

                    break;
            }

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

            // wait, we have base?
            var base = data._base, bof;

            if (base) {
                bof = this.index(base);
                if (bof < bindex) bindex = bof;
                delete data._base;
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

            var tnode = this.nodeof(target);

            if (tnode.length) {
                this.render(RENDER_APPEND, true);
            }

            silent = silent === undef ? false : silent;

            var origin = data._origin;
            delete data._origin;
            
            if ( ! silent) {
                this.fire('move', data, action, target, origin);
            }

        },
        _insert: function (data, action, target, silent) {
            var fields = this.options.fields;
            var dindex, bindex, child, chpos, pos, d;

            switch(action) {
                case 'append':
                    data._last   = true;
                    data._root   = target._root;
                    data._parent = target;
                    data._metachanged = true;

                    data[fields.left]  = -1;
                    data[fields.right] = -1;
                    data[fields.path]  =  target[fields.path] + '/' + data[fields.id];
                    
                    // target[fields.leaf]  = 0;
                    // data[fields.path]  =  target[fields.path] + '/' + data[fields.id];
                    // data[fields.level] = +target[fields.level] + 1;

                    child = target._child || [];

                    if (child.length) {
                        dindex = this.index(this.get(child[child.length - 1])) + 1;
                    } else {
                        dindex = this.index(target) + 1;
                    }

                    bindex = this.index(target);

                    target._child = [];
                    target[fields.leaf] = 0;
                    target[fields.expand] = 1;
                    target._metachanged = true;

                    pos = +target[fields.right];
                    break;
                case 'before':

                    data._last   = false;
                    data._root   = target._root;
                    data._parent = target._parent;
                    data._metachanged = true;

                    data[fields.left]  = -1;
                    data[fields.right] = -1;
                    // data[fields.level] = target[fields.level];

                    dindex = this.index(target);
                    bindex = dindex;
                    pos    = this.left(target);

                    if (data._parent) {
                        child  = data._parent._child || [];
                        chpos = _h.indexof(child, target[fields.id]);
                        chpos = chpos < -1 ? 0 : chpos;
                        child.splice(chpos, 0, data);
                        
                        data[fields.path] = data._parent[fields.path] + '/' + data[fields.id];
                        data._parent._child = [];
                    } else {
                        data[fields.path] = data[fields.id];
                    }

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

            this._data.splice(dindex, 0, data);

            this._reindex(bindex);
            this._rebuild(bindex);

            silent = silent === undef ? false : silent;

            if ( ! this.isvisible(target)) {
                this.scroll(target, $.proxy(function(){
                    this.render(RENDER_APPEND, true);
                    this.flash(data);

                    if ( ! silent) {
                        this.fire('insert', data, action, target);    
                    }
                }, this));
            } else {
                this.render(RENDER_APPEND, true);
                this.flash(data);

                if ( ! silent) {
                    this.fire('insert', data, action, target);
                }
            }
        },
        /** @private */
        _startEdit: function (node) {
            var 
                fields = this.options.fields,
                data = this.dataof(node),
                text = data[fields.text];

            if (data._editing) {
                return;
            }

            var evt = $.Event('beforeedit.bt');
            
            this.fire(evt, data, node);

            if (evt.isDefaultPrevented()) {
                evt = null;
                return;
            }

            evt = null;

            // stop other active editing
            this._stopEdit();

            // make selection
            this.select(node);

            // place editor
            this.editor.appendTo(node.find('.bt-text'));
            this.input.val(text).focus();

            data._editing = true;

            // defer text select
            var defer = $.debounce(1, function (){
                _h.seltext(this.input, text.length);
            });

            defer.call(this);
        },
        /** @private */
        _stopEdit: function (detach) {
            var node = this.editor.closest('.bt-node');
            if (node.length) {
                var 
                    fields = this.options.fields,
                    data = this.dataof(node),
                    text = this.input.val(),
                    spec = {};

                detach = detach === undef ? true : false;

                if (detach) {
                    data._editing = false;
                    this.editor.detach();
                    node.find('.bt-text').html(text);
                }

                if (text != data[fields.text]) {
                    spec[fields.text] = text;
                    this.update(data, text);
                }
            }
        },
        /** @private */
        fire: function () {
            var args = $.makeArray(arguments), 
                name = args.shift();

            if ($.type(name) === 'string') {
                name += '.bt';
            }

            return this.element.trigger(name, args);
        },
        scrollable: function () {
            return this.element[0].scrollHeight > this.element.height();
        },
        load: function (data, render) {
            var 
                fields = this.options.fields,
                start = this._data.length,
                stop;

            this._data.push.apply(this._data, (data || []));
            stop = this._data.length;

            this._reindex(start, stop);
            this._rebuild(start, stop);

            render = render === undef ? false : render;
            render && this.render(RENDER_APPEND, false);
        },
        render: function (type, cleanup) {
            var 
                buffer = this._buffer,
                height = this.element.height(),
                offset = 0 - this.grid.position().top,
                stacks = $.grep(this._data, function(d){ return ! d._hidden; });

            var begpix, endpix;

            type = type === undef ? RENDER_APPEND : type;
            cleanup = cleanup === undef ? false : cleanup;

            if (type == RENDER_APPEND) {
                begpix = offset;
                endpix = begpix + height + buffer;
            } else {
                begpix = offset - buffer;
                endpix = begpix + buffer + height;
            }

            begpix = begpix < 0 ? 0 : begpix;

            var
                begrow = Math.floor(begpix / this.options.itemSize),
                endrow = Math.ceil(endpix / this.options.itemSize),
                padtop = this.options.itemSize * begrow,
                padbtm = this.options.itemSize * stacks.slice(endrow).length;

            this.grid.css({
                paddingTop: padtop,
                paddingBottom: padbtm
            });

            this._renderRange(stacks, begrow, endrow, type, cleanup);
        },
        scroll: function (data, callback) {
            var 
                element = this.element,
                options = this.options,
                stacks  = $.grep(this._data, function (d){ return ! d._hidden; }),
                offset  = _h.indexof(stacks, data) * options.itemSize - (parseInt(this.grid.css('margin-top'), 10) || 0),
                currtop = element.scrollTop(),
                duration = Math.abs(currtop - offset);

            callback = callback || $.noop;
            element.animate({scrollTop: offset}, duration, 'swing', callback);
        },
        visible: function () {
            return this._visible;
        },
        update: function(data, text, silent) {
            var fields = this.options.fields, node;

            data[fields.text] = text;
            
            node = this.nodeof(data);

            if (node.length) {
                if ( ! data._editing) {
                    node.find('.bt-text').html(text);
                } else {
                    node.find('.bt-text input').val(text);
                }
            }

            silent = silent === undef ? false : silent;

            if ( ! silent) {
                this.fire('update', data, fields.text, text);
            }
        },
        create: function (data, silent) {
            data._root = null;
            data._parent = null;
            data._last = true;
            data._metachanged = true;

            this._data.push(data);
            
            this._reindex();
            this._rebuild();

            this.render(RENDER_APPEND, true);

            silent = silent === undef ? false : silent;

            if ( ! silent) {
                this.fire('insert', data, 'create', null);
            }
        },
        remove: function (data, cascade, silent) {
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
                        prev = this.prev(data);

                    var child, size, key;

                    removed.unshift(data);
                    size = removed.length;

                    for (var i = 0; i < size; i++) 
                        delete this._indexes[removed[i][fields.id]];

                    this._data.splice(offset, size);
                    this._reindex(offset);

                    if (owner) {
                        child = owner._child || [];
                        if (child.length) {
                            var pos = _h.indexof(child, data[fields.id]);
                            child.splice(pos, 1);
                            if ( ! child.length) {
                                owner[fields.leaf] = '1';
                            }
                            owner._child = [];
                        }
                        this._rebuild(this.index(owner));
                    } else {
                        if (prev) {
                            this._rebuild(this.index(prev));
                        } else {
                            this._rebuild(offset);    
                        }
                    }
                    
                    silent = silent === undef ? false : silent;
                    
                    if ( ! silent) {
                        this.fire('dispose', data);    
                    }

                    if (node.length) {
                        this.deselect(node);
                        this.render(RENDER_APPEND, true);
                    }
                }
                return true;
            }
            return false;
        },
        append: function (owner, data, silent) {
            if (this._isvalid(data, 'append', owner)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'append', owner, silent);
                } else {
                    var desc = this.descendants(data);
                    this._revoke(data, desc);
                    this._move(data, desc, 'append', owner, silent);
                }

                return true;
            }

            return false;
        },
        before: function (next, data, silent) {
            if (this._isvalid(data, 'before', next)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'before', next, silent);
                } else {
                    var desc = this.descendants(data);

                    this._revoke(data, desc);
                    this._move(data, desc, 'before', next, silent);
                }
                return true;
            }

            return false;
        },
        after: function (prev, data, silent) {
            if (this._isvalid(data, 'after', prev)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'after', prev, silent);
                } else {
                    var desc = this.descendants(data);
                    this._revoke(data, desc);
                    this._move(data, desc, 'after', prev, silent);
                }
                return true;
            }
            return false;
        },
        get: function (key) {
            var index = this._indexes[key];
            return this._data[index] || null;
        },
        data: function (index) {
            return index !== undef ? this._data[index] : this._data;
        },
        index: function (data) {
            if (data) {
                var key = data[this.options.fields.id],
                    idx = this._indexes[key];
                return idx === undef ? -1 : idx;
            }
            return -1;
        },
        size: function (data) {
            return this.right(data) - this.left(data) + 1;
        },
        level: function (data) {
            return +data[this.options.fields.level];
        },
        left: function (data) {
            return +data[this.options.fields.left];
        },
        right: function (data) {
            return +data[this.options.fields.right];
        },
        isphantom: function (data) {
            return this.index(data) === -1;
        },
        isleaf: function (data) {
            return this.right(data) - this.left(data) === 1;
        },
        isparent: function (data) {
            return ! this.isleaf(data);
        },
        isancestor: function (data, target) {
            return this.left(data) > this.left(target) && this.right(data) < this.right(target);
        },
        isdescendant: function (data, target) {
            return this.left(target) > this.left(data) && this.right(target) < this.right(data);
        },
        isexpanded: function (data) {
            return +data[this.options.fields.expand] === 1;
        },
        iscollapsed: function (data) {
            return ! this.isexpanded(data);
        },
        isvisible: function (data) {
            var stacks = this.visible();
            return _h.indexof(stacks, data) > -1;
        },
        isselected: function(data) {
            return this._selected == data[this.options.fields.id];
        },
        first: function () {
            return this._data[0];
        },
        last: function () {
            return this._data[this._data.length - 1];
        },
        parent: function (data) {
            return data._parent;
        },
        prev: function (data) {
            var 
                fields = this.options.fields,
                owner = data._parent,
                found = null,
                index;

            if (owner) {
                var child = owner._child || [];
                index = this._indexes[child[_h.indexof(child, data[fields.id]) - 1]];
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
        next: function (data) {
            var 
                fields = this.options.fields, 
                owner = data._parent, 
                found = null,
                index;

            if (owner) {
                var child = owner._child || [];
                index = this._indexes[child[_h.indexof(child, data[fields.id]) + 1]];
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
        descendants: function (data) {
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
        children: function (data) {
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
        nodeof: function (data) {
            if ($.isArray(data)) {
                var fields = this.options.fields;
                var query = $.map(data, function(d){ return '.bt-node[data-id='+d[fields.id]+']'; }).join(',');
                return this.grid.children(query);
            } else {
                return this.grid.children('.bt-node[data-id='+(data[this.options.fields.id])+']');    
            }
        },
        movedNode: function () {
            return this.grid.children('.ui-sortable-helper');
        },
        visibleNodes: function () {
            return this.grid.children('.bt-node:not(.ui-sortable-placeholder)');
        },
        removableNodes: function () {
            return this.grid.children().not('.ui-sortable-helper,.ui-sortable-placeholder');
        },
        selectedNode: function () {
            var node = $({});
            if (this._selected) {
                node = this.grid.children('.bt-node[data-id=' + this._selected + ']');
            }
            return node.length ? node : null;
        },
        dataof: function (node) {
            var key = node.attr('data-id');
            return this._data[this._indexes[key]];
        },
        cascade: function (data, handler, scope) {
            var desc = this.descendants(data) || [];
            desc.unshift(data);
            scope = scope || this;
            $.each(desc, function (i, d){
                $.proxy(handler, scope, d)();
            });
        },

        expand: function(data) {
            var fields = this.options.fields,
                descs = this.descendants(data),
                dsize = descs.length;

            var i;

            data[fields.expand] = '1';
            data._metachanged = true;
            
            for (i = 0; i < dsize; i++) {
                descs[i]._hidden = descs[i]._parent ? (descs[i]._parent[fields.expand] == '0' || descs[i]._parent._hidden) : false;
            }
            
            this.fire('expand', data);
            this.render(RENDER_APPEND, true);
        },
        collapse: function (data) {
            var fields = this.options.fields,
                descs = this.descendants(data),
                dsize = descs.length;

            var i;

            data[fields.expand] = '0';
            data._metachanged = true;
            
            for (i = 0; i < dsize; i++) {
                descs[i]._hidden = true;
            }

            this.fire('collapse', data);
            this.render(RENDER_APPEND, true);
        },
        flash: function(data) {
            var node = this.nodeof(data), body, drag;
            if (node.length) {
                body = node.children('.bt-node-body');
                body.addClass('flash');

                body.one(_h.transend(), function(){
                    body.removeClass('start');
                    body.one(_h.transend(), function() {
                        body.removeClass('flash');
                    });
                });

                $.debounce(1, function(){ 
                    body.addClass('start');
                })();
            }
        },
        toggle: function (node, silent, force) {
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
        select: function (node, single) {
            single = single === undef ? true : single;
            if (single) this.deselectAll();

            this._selected = node.attr('data-id');
            node.addClass('bt-selected');
        },
        deselect: function (node) {
            this._selected = null;
            node.removeClass('bt-selected');
        },
        deselectAll: function () {
            this._selected = null;
            this.grid.children('.bt-selected').removeClass('bt-selected');
        },
        selection: function () {
            var node = this.grid.children('.bt-selected');
            return node.length ? this._data[this._indexes[this._selected]] : null;
        },
        query: function (query) {

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
                data._match = false;

                if (data._query) {
                    data._hidden = data._query.hidden;
                    data[fields.expand] = data._query.expand;
                    delete data._query;
                }

                if (query) {
                    text = data[fields.text];

                    data._query = {
                        hidden: data._hidden,
                        expand: data[fields.expand]
                    };

                    var found = regex.exec(text);

                    data._hidden = true;
                    data._match  = false;

                    if (found) {

                        data._hidden = false;
                        data._match = true;

                        var owner = data._parent;

                        while(owner) {
                            if (owner._hidden) {
                                owner._hidden = false;
                            }
                            owner[fields.expand] = '1';
                            owner = owner._parent;
                        }
                    }
                }

            }

            regex = null;
            this.render(RENDER_APPEND, true);
        },
        filter: function(keys) {
            var 
                fields = this.options.fields,
                stacks = this._data,
                size = stacks.length,
                regex;

            keys = '_' + keys.join('_|_') + '_';
            regex = new RegExp(keys);

            for (var i = 0; i < size; i++) {

                if (stacks[i]._filter) {
                    stacks[i]._hidden = stacks[i]._filter.hidden;
                    stacks[i][fields.expand] = stacks[i]._filter.expand;
                    delete stacks[i]._filter;
                }

                if (keys != '__') {
                    stacks[i]._filter = {
                        hidden: stacks[i]._hidden,
                        expand: stacks[i][fields.expand]
                    };

                    var found = regex.test('_' + stacks[i][fields.id] + '_');

                    stacks[i]._hidden = true;

                    if (found) {
                        stacks[i]._hidden = false;

                        var owner = stacks[i]._parent;

                        while(owner) {
                            if (owner._hidden) {
                                owner._hidden = false;
                            }
                            owner[fields.expand] = '1';
                            owner = owner._parent;
                        }
                    }   
                }
                
            }

            stacks = null;
            regex = null;

            this.render(RENDER_APPEND, true);
        },
        swap: function (from, to, reindex) {
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
        instance: function () {
            return this;
        },
        mask: function() {
            this.masker.appendTo(this.element);
        },
        unmask: function() {
            this.masker.remove();
        },
        tickStart: function (name) {
            this.markers = this.markers || {};
            name = name === undef ? '_' : name;
            this.markers[name] = new Date();
        },
        tickStop: function (name) {
            this.markers = this.markers || {};
            name = name === undef ? '_' : name;
            if (this.markers[name] !== undef) {
                var elapsed = ((new Date() - this.markers[name]) / 1000) + 'ms';
                console.log(name + ': ' + elapsed);
            }
        },
        _onImmediateScroll: function(e){  
        },
        _onDelayedScroll: function(e) {
            var 
                currscr = this.element.scrollTop(),
                currdir = currscr > this._lastscr ? DIR_DOWN : DIR_UP,
                type = currdir == DIR_DOWN ? RENDER_APPEND : RENDER_PREPEND;

            var trigger;

            if (currdir == this._lastdir) {
                this._lastdif = this._lastdif + Math.abs(currscr - this._lastscr);
            } else {
                this._lastdif = 0;
            }

            trigger = this._lastdir == '' || currdir != this._lastdir || this._lastdif >= this._edges;
            
            if (trigger) {
                this._lastdif = 0;
                this.render(type, false);
            }

            this._lastscr = currscr;
            this._lastdir = currdir;
        },
        _onExpanderClick: function (e) {
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
        _onNavigate: function (e) {
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
        _onBeforeDrag: function (e, ui) {
            var 
                fields = this.options.fields,
                node = ui.item,
                data = this.dataof(node);

            this.deselectAll();
            this.select(node);

            node.addClass('bt-moving');

            if (data) {
                var 
                    desc = this.descendants(data),
                    size = desc.length,
                    attr;

                if (size) {
                    this.toggle(node, true, 'collapse');
                    attr = desc.map(function (d){return '.bt-node[data-id='+d[fields.id]+']';}).join(',');
                    this.grid.children(attr).remove();
                }

            }
        },
        _onAfterDrag: function (e, ui) {
            var 
                options = this.options,
                fields = options.fields,
                stacks = this._data,
                node = ui.item,
                offset = ui.position.left,
                data = this.dataof(node),
                prev = node.prev('.bt-node'),
                next = node.next('.bt-node');

            var lookup = function (current, start, level) {
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
                    this.render(RENDER_APPEND, true);
                }
            } else {
                this._debug();
                this.render(RENDER_APPEND, true);
            }
        },
        _error: function (message) {
            this._message = message;
        },
        _debug: function (message) {
            if (this.options.debug) {
                message = message === undef ? this._message : message;
                console.log(message);    
            }
        },
        empty: function() {
            this._data    = [];
            this._indexes = {};
            this._ranges  = [0, 0];
            this._visible = [];
            this._message = '';
            this._selected = null;

            this.editor.detach();
            this.grid.empty();
            this.grid.css({paddingTop: 0, paddingBottom: 0});
        },
        destroy: function (remove) {
            this.input.off('.bt');
            this.element.off('.bt');
            this.element.sortable('destroy');
            
            $.removeData(this.element[0], 'bigtree');

            this._data = null;
            this._indexes = null;
            this._selected = null;

            if (remove !== undef && remove === true) {
                this.masker.remove();
                this.masker = null;
                
                this.editor.remove();
                this.editor = null;
                
                this.element.remove();
                this.element = null;
            }
        }
    };

    $.fn.bigtree = function (options) {
        var 
            args = $.makeArray(arguments),
            init = $.type(args[0]) !== 'string',
            list,
            func;

        list = this.each(function (){
            var obj = $.data(this, 'bigtree');
            
            if ( ! obj) {
                $.data(this, 'bigtree', (obj = new BigTree(this, options)));
            }

            if ( ! init) {
                var method = args.shift();
                if ($.isFunction (obj[method])) {
                    func = obj[method].apply(obj, args);    
                } else {
                    throw Error(method + ' is not function!');
                }
            }
        });

        return init ? list : func;
    };

}(jQuery));
