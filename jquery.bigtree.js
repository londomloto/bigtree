/**
 * Bigtree
 *
 * jQuery plugin for rendering hierarchical data
 * Dependencies:
 *      - jQuery
 *      - jQuery UI
 *      - jsRender
 *      - jQuery Throttle
 *
 * @author Roso Sasongko <roso@kct.co.id>
 */
(function($){

    /** internal helpers */
    var undef = undefined;

    function make(el) {
        return el instanceof jQuery ? el : $(el);
    }

    // simple indexof, avoid checking
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

    function seltext(input, beg, end) {
        var dom = input[0];

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

    //--------------------------------------------------------

    var BigTree = function (element, options) {
        this.element = $(element);
        this.init(options);
    };
    
    BigTree.defaults = {

        params: {
            id: 'id',
            text: 'text',
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
        buffSize: 20,
        
        // scroll delay
        delay: 25,
        
        // additional leading & trailing item
        buffer: 10,
        
        // look at `markup.tpl`
        markup: '<div></div>'
        
    };

    BigTree.prototype = {

        init: function(options) {

            this.options = $.extend(true, {}, BigTree.defaults, options || {});

            this.data = [];
            this.indexes = {};
            this.orphans = [];

            this.visibleData = [];
            this.moving = {data: null, desc: [], orig: null};

            this.initComponent();
            this.initEvents();

            this.fireEvent('init');
        },

        initComponent: function() {
            var opt = this.options,
                prm = opt.params;

            this.element.addClass('bigtree').attr('tabindex', 1);

            this.editor = $('<div class="bt-editor"><input type="text"></div>');
            this.edtext = this.editor.children('input');

            this.grid   = $('<div class="bt-grid">').appendTo(this.element);

            // init template
            $.templates({
                btnode: {
                    markup: opt.markup,
                    helpers: {
                        last: function(last) {
                            return last ? 'bt-last' : '';
                        },
                        elbow: function(data) {
                            var lines = [],
                                level = +data[prm.level],
                                expanded = data[prm.expand] == '1',
                                isparent = data[prm.leaf] == '0',
                                pdata = data.$parent,
                                elbow = [];

                            while(pdata) {
                                lines[pdata[prm.level]] = pdata.$last ? 0 : 1;
                                pdata = pdata.$parent;
                            }

                            for (var i = 0; i <= level; i++) {
                                var type = '', 
                                    icon = '';

                                if (i == level) {
                                    type = 'elbow-end';
                                    if (isparent) {
                                        var cls = expanded ? 'elbow-minus' : 'elbow-plus';
                                        icon = '<span class="elbow-expander '+cls+'"></span>';
                                    }
                                } else {
                                    type = lines[i] == 1 ? 'elbow-line' : '';
                                }

                                elbow.push({
                                    type: type,
                                    icon: icon
                                });
                            }
                            return elbow;
                        }
                    }
                }
            });

            // init sortable
            this.element.sortable({
                items: '.bt-node',
                handle: '.bt-drag'
                // placeholder: 'bt-node-sortable ui-sortable-placeholder'
            });

        },

        initEvents: function() {
            var opt = this.options;

            // handle scroll event
            var lastScrollTop = this.element.scrollTop(),
                lastDirection = '',
                deltaScroll = 0;

            this.element
                .off('scroll.bt')
                .on('scroll.bt', $.throttle(opt.delay, $.proxy(function(){
                    var scrollTop = this.element.scrollTop(),
                        direction = scrollTop > lastScrollTop ? 'down' : 'up';

                    if (lastDirection != direction) {
                        deltaScroll = 0;
                    } else {
                        deltaScroll = deltaScroll + Math.abs(scrollTop - lastScrollTop);
                    }
                    
                    if (deltaScroll == 0 || deltaScroll >= (opt.buffer * opt.itemSize)) {
                        this.render();
                        deltaScroll = 0;
                    }

                    lastScrollTop = scrollTop;
                    lastDirection = direction;
                }, this)));

            // expander click
            this.element
                .off('click.bt.expander')
                .on('click.bt.expander', '.elbow-expander', $.proxy(function(e){
                    e.stopPropagation();
                    var node = $(e.currentTarget).closest('.bt-node'),
                        data = this.data[this.indexes[node.attr('data-id')]];
                    if (data) {
                        if (data[opt.params.expand] == '1') {
                            this.collapse(data);
                        } else {
                            this.expand(data);
                        }
                    }
                }, this));

            // navigation
            this.element
                .off('keydown.bt')
                .on('keydown.bt', $.proxy(this.navigate, this));

            // handle dragdrop event
            this.element
                .off('sortstart.bt')
                .on('sortstart.bt', $.proxy(function(e, ui){
                    this.moveStart(ui.item);
                }, this));

            this.element
                .off('sortstop.bt')
                .on('sortstop.bt', $.proxy(function(e, ui){
                    this.moveStop(ui.item, ui.originalPosition, ui.position);
                }, this));
            
            // selection
            this.element
                .off('click.bt.select')
                .on('click.bt.select', $.proxy(function(e){
                    this.deselectAll();
                }, this));

            // text edit
            this.element
                .off('click.bt.startedit')
                .on('click.bt.startedit', '.bt-text', $.proxy(function(e){
                    e.stopPropagation();
                    var node = $(e.currentTarget).closest('.bt-node');
                    this.startEdit(node);
                }, this));

            // editor event
            this.edtext
                .off('click.bt')
                .on('click.bt', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });

            this.edtext
                .off('keypress.bt')
                .on('keypress.bt', $.proxy(function(e){
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        this.stopEdit(false);
                    }
                }, this));

        },

        hasScroll: function() {
            return this.element.get(0).scrollHeight > this.element.height();
        },

        load: function(data) {
            var param = this.options.params,
                start = this.data.length,
                size,
                dlen,
                i;

            data = data || [];
            dlen = data.length;

            // append to existing
            this.data.push.apply(this.data, data);

            // build index
            for (
                i = dlen;
                i--;
                this.indexes[data[i][param.id]] = i + start
            );

            // build tree
            for (i = 0; i < dlen; i++) {

                var curr = this.data[i + start],
                    ckey = curr[param.id],
                    path = curr[param.path].split('/'),
                    pkey,
                    lkey,
                    ldat;

                path.pop();
                pkey = path.pop();

                curr.$parent = null;

                if (pkey) {
                    var pdat = this.data[this.indexes[pkey]];
                    if (pdat) {

                        pdat.$child = pdat.$child || [];

                        lkey = pdat.$child[pdat.$child.length - 1];
                        ldat = this.data[this.indexes[lkey]];
                            
                        if (ldat) {
                            ldat.$last = false;
                        }

                        curr.$last   = true;
                        curr.$hidden = pdat[param.expand] == '0' || pdat.$hidden;

                        curr.$parent = pdat;
                        pdat.$child.push(ckey);

                    }
                } else {

                    lkey = this.orphans[this.orphans.length - 1];
                    ldat = this.data[this.indexes[lkey]];

                    if (ldat) {
                        ldat.$last = false;
                    }
                            
                    curr.$last = true;
                    curr.$hidden = false;

                    this.orphans.push(ckey);
                }
            }

        },

        reindex: function() {
            var param = this.options.params;
            this.indexes = {};
            for (
                var i = this.data.length;
                i--;
                this.indexes[this.data[i][param.id]] = i
            );
        },

        render: function() {
            var stop = this.grid.scrollTop(),
                ptop = this.grid.position().top,
                buff = this.options.buffer * this.options.itemSize,
                spix = stop - ptop - buff;
                epix = spix + this.element.height() + buff * 2,
                data = $.grep(this.data, function(d){ return !d.$hidden; });
            
            spix = spix < 0 ? 0 : spix;

            var sidx = Math.floor(spix / this.options.itemSize),
                eidx = Math.ceil(epix / this.options.itemSize),
                padtop = this.options.itemSize * sidx,
                padbtm = this.options.itemSize * data.slice(eidx).length + 3 * this.options.itemSize;

            this.grid.css({
                paddingTop: padtop,
                paddingBottom: padbtm
            });

            // this.tickStart('render');
            this.renderRange(data, sidx, eidx);
            // this.tickStop('render');

        },

        renderRange: function(data, start, end) {
            var range = data.slice(start, end),
                param = this.options.params,
                moved = this.getMovedNode();

            this.editor.detach();
            this.getRemovableNodes().remove();

            if (moved.length) {
                range = $.grep(range, function(d){
                    return d[param.id] != moved.attr('data-id');
                });
            }

            this.visibleData = range;
            this.grid.append($.templates.btnode(range));
            this.element.focus();

            if (moved.length) {
                this.element.sortable('refresh');
            } else {
                this.decorate();
            }
        },

        decorate: function() { 
            if (this.selected) {
                var snode = this.grid.find('.bt-node[data-id='+this.selected+']');
                snode.length && this.select(snode);
            }
        },

        /** various helpers */
        getLastData: function() {
            return this.data[this.data.length - 1];
        },

        getVisibleData: function() {
            return this.visibleData;
        },

        getDataIndex: function(data) {
            var index = this.indexes[data[this.options.params.id]];
            return isNaN(index) ? -1 : index;
        },

        getDescendants: function(data) {
            var arr = [];

            function cascade(data) {
                var child = (data.$child || []).slice(0);
                while(child.length) {
                    var key = child.shift(),
                        idx = this.indexes[key],
                        row = this.data[idx];

                    if (row) {
                        arr.push(row);    
                        if (row.$child !== undef) {
                            cascade.call(this, row);
                        }
                    }
                }    
            }

            cascade.call(this, data);

            return arr;
        },

        getChildren: function(data) {
            var child = data.$child || [],
                len = child.length,
                arr = [];

            for (var i = 0; i < len; i++) {
                var idx = this.indexes[child[i]],
                    row = this.data[idx];
                if (row) {
                    arr.push(row);
                }
            }

            return arr;
        },

        getMovedNode: function() {
            return this.grid.children('.ui-sortable-helper');
        },

        getVisibleNodes: function() {
            return this.grid.children('.bt-node:not(.ui-sortable-placeholder)');
        },

        getRemovableNodes: function() {
            return this.grid.children('.bt-node:not(.ui-sortable-helper,.ui-sortable-placeholder)');
        },

        getSelectedNode: function() {
            var node = $({});
            if (this.selected) {
                node = this.grid.children('.bt-node[data-id=' + this.selected + ']');
            }
            return node.length ? node : null;
        },

        getNodeKey: function(node) {
            return make(node).attr('data-id');
        },

        getNodeData: function(node) {
            var key = this.getNodeKey(node),
                idx = this.indexes[key];
            return this.data[idx];
        },

        getNodeLevel: function(node) {
            return +make(node).attr('data-level');
        },

        isParentNode: function(node) {
            return +make(node).attr('data-leaf') === 0;
        },

        isLeafNode: function(node) {
            return +make(node).attr('data-leaf') === 1;
        },

        cascade: function(data, callback) {

        },

        expand: function(data) {
            var param = this.options.params,
                fshow = function(data) {
                    var ds = this.getChildren(data),
                        dz = ds.length;
                    for (var i = 0; i < dz; i++) {
                        ds[i].$hidden = false;
                        if (ds[i].$child !== undef && ds[i][param.expand] == '1') {
                            fshow.call(this, ds[i]);
                        }
                    }    
                };

            data[param.expand] = '1';
            fshow.call(this, data);

            this.fireEvent('expand', data);
            this.render();
        },

        collapse: function(data) {
            var param = this.options.params,
                fhide = function(data) {
                    var ds = this.getChildren(data),
                        dz = ds.length;
                    for (var i = 0; i < dz; i++) {
                        ds[i].$hidden = true;
                        if (ds[i].$child !== undef && ds[i][param.expand] == '1') {
                            fhide.call(this, ds[i]);
                        }
                    }     
                };

            data[param.expand] = '0'; 
            fhide.call(this, data);

            this.fireEvent('collapse', data);
            this.render();
        },

        expandAll: function() {

        },

        collapseAll: function() {

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

        /** @private */
        select: function(node) {
            this.selected = node.attr('data-id');
            node.addClass('bt-selected');
        },

        /** @private */
        deselect: function(node) {
            this.selected = null;
            node.removeClass('bt-selected');
        },

        /** @private */
        deselectAll: function() {
            this.selected = null;
            this.grid.find('.bt-selected').removeClass('bt-selected');
        },

        /** @private */
        startEdit: function(node) {
            var data = this.data[this.indexes[node.attr('data-id')]],
                param = this.options.params,
                holder = node.find('.bt-text'),
                text = data[param.text];

            // drop previous editing
            this.stopEdit(true);

            // ensure selection
            this.select(node);

            // place editor
            this.editor.appendTo(holder)
            this.edtext.val(text).focus();

            // defer text select
            var defer = $.debounce(1, function(){
                seltext(this.edtext, text.length);
            });

            defer.call(this);
        },

        /** @private */
        stopEdit: function(deselect) {
            var param = this.options.params,
                node = this.editor.closest('.bt-node');
                
            if (node.length) {
                var data = this.data[this.indexes[node.attr('data-id')]],
                    text = this.edtext.val(),
                    orig = data[param.text];
                
                data[param.text] = text;
                deselect = deselect === undef ? true : deselect;
                
                if (deselect) {
                    this.deselect(node);
                    // remove editor
                    this.editor.detach();
                    node.find('.bt-text').html(text);
                }

                if (text != orig) {
                    this.fireEvent('edit', data, text);
                }
            } else {
                // manual deselect...
                this.selected = null;
                this.grid.find('.bt-selected').removeClass('bt-selected');
            }

        },

        search: function(query) {
            var param = this.options.params,
                regex = new RegExp('('+query+')', 'igm'),
                size = this.data.length,
                data,
                orig,
                text,
                i;

            for (i = 0; i < size; i++) {

                data = this.data[i];
                orig = data.$orig;

                // reset first
                if (orig !== undef) {
                    data.$hidden = orig.hidden;
                    data[param.expand] = orig.expand;
                    data[param.text] = orig.text;
                    delete data.$orig;
                }

                if (query) {
                    text = data[param.text];

                    data.$orig = {
                        hidden: data.$hidden,
                        expand: data[param.expand],
                        text: text
                    };

                    var found = regex.exec(text);

                    data.$hidden = true;

                    if (found) {

                        data.$hidden = false;
                        data[param.text] = data[param.text].replace(found[1], '<span class="bt-text-hightlight">'+found[1]+'</span>');

                        var pdat = data.$parent;
                        while(pdat) {
                            if (pdat.$hidden) {
                                pdat.$hidden = false;
                            }
                            pdat[param.expand] = '1';
                            pdat = pdat.$parent;
                        }
                    }
                }

            }

            regex = null;
            this.render();
        },

        /** @private */
        moveStart: function(node) {
            var param = this.options.params,
                data = this.getNodeData(node);
            
            node.addClass('bt-moving');

            // we have to detach from collection
            if (data) {
                var isparent = data[param.leaf] == '0',
                    expanded = data[param.expand] == '1',
                    desc = (isparent && this.getDescendants(data)) || [],
                    size = desc.length,
                    pdat = data.$parent,
                    key = data[param.id],
                    idx = this.indexes[key];

                // reset
                this.moving.data = this.data.splice(idx, 1)[0];
                this.moving.desc = [];
                this.moving.orig = {};

                if (size) {
                    this.moving.desc = this.data.splice(idx, size);
                    if (expanded) {
                        this.toggle(node, true, 'collapse');
                        var attrs = desc.map(function(d){return '[data-id='+d[param.id]+']';}).join(',');
                        this.grid.find(attrs).remove();
                    }
                }

                this.moving.orig.$index = idx;

                if (pdat) {
                    
                    var posidx = indexof(pdat.$child, key);

                    this.moving.data.$parent = null;
                    this.moving.orig.$parent = pdat;
                    this.moving.orig.$posidx = posidx;

                    pdat.$child.splice(posidx, 1);
                    
                    if ( ! pdat.$child.length) {
                        pdat.$child = undefined;
                        pdat[param.leaf] = '1';
                    }
                    
                }

                this.reindex();
            }
        },

        /** @private */
        moveStop: function(node, opos, npos) {
            var opt = this.options,
                param = opt.params,
                prev = node.prev('.bt-node'),
                next = node.next('.bt-node'),
                oidx = -1; // offset index

            node.removeClass('bt-moving');

            if (this.moving.data) {
                
                // take advantages by ommiting `prev` index calculation
                if (next.length) {
                    oidx = this.indexes[next.attr('data-id')];
                } else if (prev.length) {
                    var xkey = prev.attr('data-id'),
                        xidx = this.indexes[xkey],
                        xdat = this.data[xidx];

                    if (xdat[param.leaf] == '0' && xdat[param.expand] == '0') {
                        var xdes = this.getDescendants(xdat);
                        oidx = xidx + xdes.length + 1;
                    } else {
                        oidx = xidx + 1;
                    }
                }

                this.data.splice(oidx, 0, this.moving.data);

                if (this.moving.desc.length) {
                    oidx++;
                    var args = [oidx, 0].concat(this.moving.desc);
                    Array.prototype.splice.apply(this.data, args);
                }

                this.reindex();

                if (this.moving.orig.$parent) {
                    var echild = this.moving.orig.$parent.$child || [];
                    if (echild.length) {
                        var enddat = this.data[this.indexes[echild[echild.length - 1]]];
                        if (enddat) {
                            enddat.$last = true;
                        }
                    }
                }

                var currkey = this.moving.data[param.id],
                    curridx = this.indexes[currkey],
                    currdat = this.data[curridx],
                    currlev = +currdat[param.level],
                    datalev = null;

                var posLeft = npos.left - opt.buffSize;
                    
                // setup new position
                if (posLeft < -opt.dragSize) { // to left
                    datalev = currlev - (Math.round(Math.abs(posLeft) / opt.stepSize));
                } else if (posLeft > opt.dragSize) { // to right
                    datalev = currlev + (Math.round(posLeft / opt.stepSize));
                } else { // none
                    datalev = currlev;
                }

                datalev = datalev < 0 ? 0 : datalev;
                
                if (prev.length) {
                    var prevkey = prev.attr('data-id'),
                        previdx = this.indexes[prevkey],
                        prevdat = this.data[previdx],
                        prevlev = +prevdat[param.level],
                        prevpos,
                        prevpar;

                    if (prevdat[param.leaf] == '1') {
                        if (datalev > prevlev) {
                            // as new child
                            currdat.$parent = prevdat;
                            currdat.$last = true;
                            currdat[param.level] = prevlev + 1;

                            prevdat.$child = [currkey];
                            prevdat.$last = true;

                            if (prevdat.$parent) {
                                prevdat.$last = indexof(prevdat.$parent.$child, prevkey) == 
                                        prevdat.$parent.$child.length - 1;
                            }

                            prevdat[param.leaf] = '0';
                            prevdat[param.expand] = '1';

                        } else if (datalev == prevlev) {
                            // as sibling
                            if (prevdat.$parent) {
                                prevpos = indexof(prevdat.$parent.$child, prevkey);
                                currdat.$parent = prevdat.$parent;
                                currdat.$last = prevpos == prevdat.$parent.$child.length - 1;
                                currdat[param.level] = datalev;
                                
                                prevdat.$last = false;
                                prevdat.$parent.$child.splice(prevpos + 1, 0, currkey);
                            } else {
                                currdat.$parent = null;
                                currdat.$last = this.data[curridx + 1] === false;
                                currdat[param.level] = prevlev;
                            }
                        } else {
                            // ugh... bubbling
                            this.bubbleMove(currdat, curridx, datalev, previdx);
                        }
                    } else {
                        if (prevdat[param.expand] == '0') {
                            if (datalev > prevlev || datalev == prevlev) {
                                // as sibling
                                if (prevdat.$parent) {
                                    prevpos = indexof(prevdat.$parent.$child, prevkey);
                                    currdat.$parent = prevdat.$parent;
                                    currdat.$last = prevpos == prevdat.$parent.$child.length - 1;
                                    currdat[param.level] = prevlev;

                                    prevdat.$last = false;
                                    prevdat.$parent.$child.splice(prevpos + 1, 0, currkey);
                                } else {
                                    currdat.$parent = null;
                                    currdat.$last = this.data[curridx + 1] === false;
                                    currdat[param.level] = prevlev;   
                                }
                            } else {
                                // ugh... bubbling
                                this.bubbleMove(currdat, curridx, datalev, previdx);
                            }
                        } else {
                            if (datalev > prevlev) {
                                // as fists child
                                currdat.$parent = prevdat;
                                currdat.$last = false;
                                currdat[param.level] = prevlev + 1;

                                prevdat.$child.unshift(currkey);
                            } else {
                                this.bubbleMove(currdat, curridx, datalev, previdx);
                            }
                        }
                    }
                } else if (next.length) {
                    var nextkey = next.attr('data-id'),
                        nextidx = this.indexes[nextkey],
                        nextdat = this.data[nextidx];

                    currdat.$parent = nextdat.$parent;
                    currdat.$last = false;
                    currdat[param.level] = nextdat[param.level];

                } else {
                    currdat.$parent = null;
                    currdat.$last = true;
                    currdat[param.level] = 0;
                }

                if (this.moving.desc) {
                    var dlen = this.moving.desc.length, 
                        width = +currdat[param.level] - currlev,
                        i;
                    for (i = 0; i < dlen; i++) {
                        this.moving.desc[i][param.level] = +this.moving.desc[i][param.level] + width;
                    }
                }

                this.moving.data = null;
                this.moving.desc = [];
                this.moving.orig = null;

                this.render();

                // prepare event
                var position = this.position(currdat);
                this.fireEvent('move', currdat, position);

            }
            
        },

        bubbleMove: function(currdat, curridx, datalev, previdx) {
            var param = this.options.params,
                budat = this.data[previdx],
                bupos = 0,
                dslev = datalev - 1,
                bulev;

            while(budat) {
                bulev = +budat[param.level];
                if (bulev == datalev) {
                    budat.$last = false;
                    bupos++;
                }
                if (bulev == dslev) break;
                budat = this.data[previdx--];
            }

            var invalid = false;

            if (budat) {
                var nextdat = this.data[curridx + 1];
                if (nextdat && +nextdat[param.level] > datalev) {
                    invalid = true;
                } else {
                    currdat.$parent = budat;
                    budat.$child = budat.$child || [];
                    budat.$child.splice(bupos, 0, currdat[param.id]);
                    currdat.$last = bupos == budat.$child.length - 1;
                    currdat[param.level] = datalev;
                }
            } else {
                invalid = true;
            }

            if (invalid) {
                // hard reset
                var orig = this.moving.orig;

                if (orig.$parent) {
                    currdat.$parent = orig.$parent;
                    if (orig.$parent.$child === undef) {
                        orig.$parent.$child = [currdat[param.id]];
                        orig.$parent[param.leaf] = '0';
                    } else {
                        orig.$parent.$child.splice(orig.$posidx, 0, currdat[param.id]);
                    }
                }

                this.moveData(curridx, orig.$index);
            }

        },

        position: function(data) {
            var pos = {parent: null, prev: null, next: null},
                params = this.options.params,
                level = data[params.level],
                index;

            if (data.$parent) {
                var child = data.$parent.$child || [], pkey, prev, nkey, next;

                pos.parent = data.$parent;

                index = indexof(child, data[params.id]);

                pkey  = child[index - 1];
                nkey  = child[index + 1];

                if (pkey) {
                    pos.prev = this.data[this.indexes[pkey]];
                }

                if (nkey) {
                    pos.next = this.data[this.indexes[nkey]];
                }
            } else {
                index = this.indexes[data[params.id]];

                pos.prev = this.data[index - 1] || null;
                pos.next = this.data[index + 1] || null;
            }
            
            return pos;
        },

        /** @deprecated */
        _moveData: function(from, to) {
            this.data.splice(to, 0, this.data.splice(from, 1)[0]);
            this.reindex();
        },

        /** @private */
        moveData: function(from, to) {
            var size = this.data.length, tmp, i;
            if (from != to && from >= 0 && from <= size && to >= 0 && to <= size) {
                tmp = this.data[from];
                if (from < to) {
                    for (i = from; i < to; i++) {
                        this.data[i] = this.data[i+1];
                    }
                } else {
                    for (i = from; i > to; i--) {
                        this.data[i] = this.data[i-1];
                    }
                }
                this.data[to] = tmp;
                this.reindex();
            }
        },

        // internal function
        navigate: function(e) {
            var code = e.keyCode || e.which;
            
            if (code == 9 || code == 38 || code == 40) {
                var node = this.grid.find('.bt-selected'),
                    next,
                    prev;

                e.preventDefault();

                if (node.length) {
                    
                    switch(code) {
                        // tab
                        case 9:
                            var method = e.shiftKey ? 'prev' : 'next',
                                target = node[method].call(node);
                            target.length && this.startEdit(target);
                        break;
                        // up
                        case 38:
                            prev = node.prev('.bt-node');
                            prev.length && this.startEdit(prev);
                        break;
                        // down
                        case 40:
                            next = node.next('.bt-node');
                            next.length && this.startEdit(next);
                        break;

                    }    
                }

            }
            
        },

        plugin: function() {
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

        fireEvent: function() {
            var args = $.makeArray(arguments),
                name = args.shift() + '.bt';
            this.element.trigger(name, args);
        },
        
        destroy: function(remove) {

            this.edtext.off('.bt');

            this.element.off('.bt');
            this.element.sortable('destroy');

            $.removeData(this.element.get(0), 'bigtree');

            this.data = null;
            this.indexes = null;
            this.orphans = null;
            this.selected = null;

            if (remove !== undef && remove === true) {
                this.editor.remove();
                this.element.remove();
            }
        }

    };

    $.fn.bigtree = function(options) {
        var args = $.makeArray(arguments),
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
