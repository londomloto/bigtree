/*! JsRender v0.9.79 (Beta): http://jsviews.com/#jsrender */
/*! **VERSION FOR WEB** (For NODE.JS see http://jsviews.com/download/jsrender-node.js) */
!function(e,t){var n=t.jQuery;"object"==typeof exports?module.exports=n?e(t,n):function(n){if(n&&!n.fn)throw"Provide jQuery or null";return e(t,n)}:"function"==typeof define&&define.amd?define(function(){return e(t)}):e(t,!1)}(function(e,t){"use strict";function n(e,t){return function(){var n,r=this,i=r.base;return r.base=e,n=t.apply(r,arguments),r.base=i,n}}function r(e,t){return te(t)&&(t=n(e?e._d?e:n(s,e):s,t),t._d=1),t}function i(e,t){for(var n in t.props)Re.test(n)&&(e[n]=r(e[n],t.props[n]))}function o(e){return e}function s(){return""}function a(e){try{throw console.log("JsRender dbg breakpoint: "+e),"dbg breakpoint"}catch(t){}return this.base?this.baseApply(arguments):e}function d(e){this.name=(t.link?"JsViews":"JsRender")+" Error",this.message=e||this.name}function u(e,t){for(var n in t)e[n]=t[n];return e}function l(e,t,n){return e?(de.delimiters=[e,t,ve=n?n.charAt(0):ve],pe=e.charAt(0),ce=e.charAt(1),fe=t.charAt(0),ge=t.charAt(1),e="\\"+pe+"(\\"+ve+")?\\"+ce,t="\\"+fe+"\\"+ge,G="(?:(\\w+(?=[\\/\\s\\"+fe+"]))|(\\w+)?(:)|(>)|(\\*))\\s*((?:[^\\"+fe+"]|\\"+fe+"(?!\\"+ge+"))*?)",ae.rTag="(?:"+G+")",G=new RegExp("(?:"+e+G+"(\\/)?|\\"+pe+"(\\"+ve+")?\\"+ce+"(?:(?:\\/(\\w+))\\s*|!--[\\s\\S]*?--))"+t,"g"),ae.rTmpl=W=new RegExp("<.*>|([^\\\\]|^)[{}]|"+e+".*"+t),le):de.delimiters}function p(e,t){t||e===!0||(t=e,e=void 0);var n,r,i,o,s=this,a=!t||"root"===t;if(e){if(o=t&&s.type===t&&s,!o)if(n=s.views,s._.useKey){for(r in n)if(o=t?n[r].get(e,t):n[r])break}else for(r=0,i=n.length;!o&&i>r;r++)o=t?n[r].get(e,t):n[r]}else if(a)for(;s.parent;)o=s,s=s.parent;else for(;s&&!o;)o=s.type===t?s:void 0,s=s.parent;return o}function c(){var e=this.get("item");return e?e.index:void 0}function f(){return this.index}function g(t){var n,r=this,i=r.linkCtx,o=(r.ctx||{})[t];return void 0===o&&i&&i.ctx&&(o=i.ctx[t]),void 0===o&&(o=oe[t]),o&&te(o)&&!o._wrp&&(n=function(){return o.apply(this&&this!==e?this:r,arguments)},n._wrp=r,u(n,o)),n||o}function v(e){return e&&(e.fn?e:this.getRsc("templates",e)||re(e))}function h(e,t,n,r){var o,s,a="number"==typeof n&&t.tmpl.bnds[n-1],d=t.linkCtx;return void 0!==r?n=r={props:{},args:[r]}:a&&(n=a(t.data,t,ae)),s=n.args[0],(e||a)&&(o=d&&d.tag,o||(o=u(new ae._tg,{_:{inline:!d,bnd:a,unlinked:!0},tagName:":",cvt:e,flow:!0,tagCtx:n}),d&&(d.tag=o,o.linkCtx=d),n.ctx=L(n.ctx,(d?d.view:t).ctx)),o._er=r&&s,i(o,n),n.view=t,o.ctx=n.ctx||o.ctx||{},n.ctx=void 0,s=o.cvtArgs("true"!==e&&e)[0],s=a&&t._.onRender?t._.onRender(s,t,o):s),void 0!=s?s:""}function m(e){var t=this,n=t.tagCtx,r=n.view,i=n.args;return e=e||t.convert,e=e&&(""+e===e?r.getRsc("converters",e)||S("Unknown converter: '"+e+"'"):e),i=i.length||n.index?e?i.slice():i:[r.data],e&&(e.depends&&(t.depends=ae.getDeps(t.depends,t,e.depends,e)),i[0]=e.apply(t,i)),i}function w(e,t){for(var n,r,i=this;void 0===n&&i;)r=i.tmpl&&i.tmpl[e],n=r&&r[t],i=i.parent;return n||Y[e][t]}function x(e,t,n,r,o,s){t=t||X;var a,d,u,l,p,c,f,g,v,h,m,w,x,b,_,y,k,j,C,A="",T=t.linkCtx||0,V=t.ctx,R=n||t.tmpl,M="number"==typeof r&&t.tmpl.bnds[r-1];for("tag"===e._is?(a=e,e=a.tagName,r=a.tagCtxs,u=a.template):(d=t.getRsc("tags",e)||S("Unknown tag: {{"+e+"}} "),u=d.template),void 0!==s?(A+=s,r=s=[{props:{},args:[]}]):M&&(r=M(t.data,t,ae)),g=r.length,f=0;g>f;f++)h=r[f],(!T||!T.tag||f&&!T.tag._.inline||a._er)&&((w=R.tmpls&&h.tmpl)&&(w=h.content=R.tmpls[w-1]),h.index=f,h.tmpl=w,h.render=N,h.view=t,h.ctx=L(h.ctx,V)),(n=h.props.tmpl)&&(h.tmpl=t.getTmpl(n)),a||(a=new d._ctr,x=!!a.init,a.parent=c=V&&V.tag,a.tagCtxs=r,C=a.dataMap,T&&(a._.inline=!1,T.tag=a,a.linkCtx=T),(a._.bnd=M||T.fn)?a._.arrVws={}:a.dataBoundOnly&&S("{^{"+e+"}} tag must be data-bound")),r=a.tagCtxs,C=a.dataMap,h.tag=a,C&&r&&(h.map=r[f].map),a.flow||(m=h.ctx=h.ctx||{},l=a.parents=m.parentTags=V&&L(m.parentTags,V.parentTags)||{},c&&(l[c.tagName]=c),l[a.tagName]=m.tag=a);if(!(a._er=s)){for(i(a,r[0]),a.rendering={},f=0;g>f;f++)h=a.tagCtx=r[f],k=h.props,y=a.cvtArgs(),(b=k.dataMap||C)&&(y.length||k.dataMap)&&(_=h.map,_&&_.src===y[0]&&!o||(_&&_.src&&_.unmap(),_=h.map=b.map(y[0],k,void 0,!a._.bnd)),y=[_.tgt]),a.ctx=h.ctx,f||(x&&(j=a.template,a.init(h,T,a.ctx),x=void 0),T&&(T.attr=a.attr=T.attr||a.attr),p=a.attr,a._.noVws=p&&p!==Ee),v=void 0,a.render&&(v=a.render.apply(a,y)),y.length||(y=[t]),void 0===v&&(v=h.render(y[0],!0)||(o?void 0:"")),A=A?A+(v||""):v;a.rendering=void 0}return a.tagCtx=r[0],a.ctx=a.tagCtx.ctx,a._.noVws&&a._.inline&&(A="text"===p?ie.html(A):""),M&&t._.onRender?t._.onRender(A,t,a):A}function b(e,t,n,r,i,o,s,a){var d,u,l,p=this,f="array"===t;p.content=a,p.views=f?[]:{},p.parent=n,p.type=t||"top",p.data=r,p.tmpl=i,l=p._={key:0,useKey:f?0:1,id:""+$e++,onRender:s,bnds:{}},p.linked=!!s,n?(d=n.views,u=n._,u.useKey?(d[l.key="_"+u.useKey++]=p,p.index=Ue,p.getIndex=c):d.length===(l.key=p.index=o)?d.push(p):d.splice(o,0,p),p.ctx=e||n.ctx):p.ctx=e}function _(e){var t,n,r,i,o,s,a;for(t in Oe)if(o=Oe[t],(s=o.compile)&&(n=e[t+"s"]))for(r in n)i=n[r]=s(r,n[r],e,0),i._is=t,i&&(a=ae.onStore[t])&&a(r,i,s)}function y(e,t,n){function i(){var t=this;t._={inline:!0,unlinked:!0},t.tagName=e}var o,s,a,d=new ae._tg;if(te(t)?t={depends:t.depends,render:t}:""+t===t&&(t={template:t}),s=t.baseTag){t.flow=!!t.flow,t.baseTag=s=""+s===s?n&&n.tags[s]||se[s]:s,d=u(d,s);for(a in t)d[a]=r(s[a],t[a])}else d=u(d,t);return void 0!==(o=d.template)&&(d.template=""+o===o?re[o]||re(o):o),d.init!==!1&&((i.prototype=d).constructor=d._ctr=i),n&&(d._parentTmpl=n),d}function k(e){return this.base.apply(this,e)}function j(e,n,r,i){function o(n){var o,a;if(""+n===n||n.nodeType>0&&(s=n)){if(!s)if(/^\.\/[^\\:*?"<>]*$/.test(n))(a=re[e=e||n])?n=a:s=document.getElementById(n);else if(t.fn&&!W.test(n))try{s=t(document).find(n)[0]}catch(d){}s&&(i?n=s.innerHTML:(o=s.getAttribute(Se),o?o!==Ie?(n=re[o],delete re[o]):t.fn&&(n=t.data(s)[Ie]):(e=e||(t.fn?Ie:n),n=j(e,s.innerHTML,r,i)),n.tmplName=e=e||o,e!==Ie&&(re[e]=n),s.setAttribute(Se,e),t.fn&&t.data(s,Ie,n))),s=void 0}else n.fn||(n=void 0);return n}var s,a,d=n=n||"";return 0===i&&(i=void 0,d=o(d)),i=i||(n.markup?n:{}),i.tmplName=e,r&&(i._parentTmpl=r),!d&&n.markup&&(d=o(n.markup))&&d.fn&&(d=d.markup),void 0!==d?(d.fn||n.fn?d.fn&&(a=d):(n=V(d,i),U(d.replace(ke,"\\$&"),n)),a||(_(i),a=u(function(){return n.render.apply(n,arguments)},n)),e&&!r&&e!==Ie&&(qe[e]=a),a):void 0}function C(e,n){return t.isFunction(e)?e.call(n):e}function A(e){var t,n=[],r=e.length;for(t=0;r>t;t++)n.push(e[t].unmap());return n}function T(e,n){function r(e){l.apply(this,e)}function i(){return new r(arguments)}function o(e,t){var n,r,i,o,s,a=c.length;for(n=0;a>n;n++)o=c[n],r=void 0,o+""!==o&&(r=o,o=r.getter),void 0===(s=e[o])&&r&&void 0!==(i=r.defaultVal)&&(s=C(i,e)),t(s,r&&p[r.type],o)}function s(n){n=n+""===n?JSON.parse(n):n;var r,i,s,u=n,l=[];if(t.isArray(n)){for(n=n||[],i=n.length,r=0;i>r;r++)l.push(this.map(n[r]));return l._is=e,l.unmap=d,l.merge=a,l}if(n){o(n,function(e,t){t&&(e=t.map(e)),l.push(e)}),u=this.apply(this,l);for(s in n)s===ee||b[s]||(u[s]=n[s])}return u}function a(e){e=e+""===e?JSON.parse(e):e;var n,r,s,a,d,u,l,p,c,f,v=this;if(t.isArray(v)){for(p={},f=[],s=e.length,a=v.length,n=0;s>n;n++){for(c=e[n],l=!1,r=0;a>r&&!l;r++)p[r]||(u=v[r],g&&(p[r]=l=g+""===g?c[g]&&(b[g]?u[g]():u[g])===c[g]:g(u,c)));l?(u.merge(c),f.push(u)):f.push(i.map(c))}return void(x?x(v).refresh(f,!0):v.splice.apply(v,[0,v.length].concat(f)))}o(e,function(e,t,n){t?v[n]().merge(e):v[n](e)});for(d in e)d===ee||b[d]||(v[d]=e[d])}function d(){var e,n,r,i,o,s,a=this;if(t.isArray(a))return A(a);for(e={},i=c.length,r=0;i>r;r++)n=c[r],o=void 0,n+""!==n&&(o=n,n=o.getter),s=a[n](),e[n]=o&&s&&p[o.type]?t.isArray(s)?A(s):s.unmap():s;for(n in a)"_is"===n||b[n]||n===ee||"_"===n.charAt(0)&&b[n.slice(1)]||t.isFunction(a[n])||(e[n]=a[n]);return e}var u,l,p=this,c=n.getters,f=n.extend,g=n.id,v=t.extend({_is:e||"unnamed",unmap:d,merge:a},f),h="",m="",w=c?c.length:0,x=t.observable,b={};for(r.prototype=v,u=0;w>u;u++)!function(e){e=e.getter||e,b[e]=u+1;var t="_"+e;h+=(h?",":"")+e,m+="this."+t+" = "+e+";\n",v[e]=v[e]||function(n){return arguments.length?void(x?x(this).setProperty(e,n):this[t]=n):this[t]},x&&(v[e].set=v[e].set||function(e){this[t]=e})}(c[u]);return l=new Function(h,m.slice(0,-1)),l.prototype=v,v.constructor=l,i.map=s,i.getters=c,i.extend=f,i.id=g,i}function V(e,n){var r,i=ue._wm||{},o=u({tmpls:[],links:{},bnds:[],_is:"template",render:N},n);return o.markup=e,n.htmlTag||(r=Ae.exec(e),o.htmlTag=r?r[1].toLowerCase():""),r=i[o.htmlTag],r&&r!==i.div&&(o.markup=t.trim(o.markup)),o}function R(e,t){function n(i,o,s){var a,d,u,l;if(i&&typeof i===Fe&&!i.nodeType&&!i.markup&&!i.getTgt&&!("viewModel"===e&&i.getters||i.extend)){for(u in i)n(u,i[u],o);return o||Y}return void 0===o&&(o=i,i=void 0),i&&""+i!==i&&(s=o,o=i,i=void 0),l=s?"viewModel"===e?s:s[r]=s[r]||{}:n,d=t.compile,null===o?i&&delete l[i]:(o=d?d.call(l,i,o,s,0):o,i&&(l[i]=o)),d&&o&&(o._is=e),o&&(a=ae.onStore[e])&&a(i,o,d),o}var r=e+"s";Y[r]=n}function M(e){le[e]=function(t){return arguments.length?(de[e]=t,le):de[e]}}function $(e){function t(t,n){this.tgt=e.getTgt(t,n)}return te(e)&&(e={getTgt:e}),e.baseMap&&(e=u(u({},e.baseMap),e)),e.map=function(e,n){return new t(e,n)},e}function N(e,t,n,r,i,o){var s,a,d,u,l,p,c,f,g=r,v="";if(t===!0?(n=t,t=void 0):typeof t!==Fe&&(t=void 0),(d=this.tag)?(l=this,g=g||l.view,u=g.getTmpl(d.template||l.tmpl),arguments.length||(e=g)):u=this,u){if(!g&&e&&"view"===e._is&&(g=e),g&&e===g&&(e=g.data),p=!g,me=me||p,g||((t=t||{}).root=e),!me||ue.useViews||u.useViews||g&&g!==X)v=E(u,e,t,n,g,i,o,d);else{if(g?(c=g.data,f=g.index,g.index=Ue):(g=X,g.data=e,g.ctx=t),ne(e)&&!n)for(s=0,a=e.length;a>s;s++)g.index=s,g.data=e[s],v+=u.fn(e[s],g,ae);else g.data=e,v+=u.fn(e,g,ae);g.data=c,g.index=f}p&&(me=void 0)}return v}function E(e,t,n,r,i,o,s,a){function d(e){_=u({},n),_[x]=e}var l,p,c,f,g,v,h,m,w,x,_,y,k="";if(a&&(w=a.tagName,y=a.tagCtx,n=n?L(n,a.ctx):a.ctx,e===i.content?h=e!==i.ctx._wrp?i.ctx._wrp:void 0:e!==y.content?e===a.template?(h=y.tmpl,n._wrp=y.content):h=y.content||i.content:h=i.content,y.props.link===!1&&(n=n||{},n.link=!1),(x=y.props.itemVar)&&("~"!==x.charAt(0)&&I("Use itemVar='~myItem'"),x=x.slice(1))),i&&(s=s||i._.onRender,n=L(n,i.ctx)),o===!0&&(v=!0,o=0),s&&(n&&n.link===!1||a&&a._.noVws)&&(s=void 0),m=s,s===!0&&(m=void 0,s=i._.onRender),n=e.helpers?L(e.helpers,n):n,_=n,ne(t)&&!r)for(c=v?i:void 0!==o&&i||new b(n,"array",i,t,e,o,s),i&&i._.useKey&&(c._.bnd=!a||a._.bnd&&a),x&&(c.it=x),x=c.it,l=0,p=t.length;p>l;l++)x&&d(t[l]),f=new b(_,"item",c,t[l],e,(o||0)+l,s,h),g=e.fn(t[l],f,ae),k+=c._.onRender?c._.onRender(g,f):g;else x&&d(t),c=v?i:new b(_,w||"data",i,t,e,o,s,h),a&&!a.flow&&(c.tag=a),k+=e.fn(t,c,ae);return m?m(k,c):k}function F(e,t,n){var r=void 0!==n?te(n)?n.call(t.data,e,t):n||"":"{Error: "+e.message+"}";return de.onError&&void 0!==(n=de.onError.call(t.data,e,n&&r,t))&&(r=n),t&&!t.linkCtx?ie.html(r):r}function S(e){throw new ae.Err(e)}function I(e){S("Syntax error\n"+e)}function U(e,t,n,r,i){function o(t){t-=v,t&&m.push(e.substr(v,t).replace(_e,"\\n"))}function s(t,n){t&&(t+="}}",I((n?"{{"+n+"}} block has {{/"+t+" without {{"+t:"Unmatched or missing {{/"+t)+", in template:\n"+e))}function a(a,d,u,c,g,x,b,_,y,k,j,C){(b&&d||y&&!u||_&&":"===_.slice(-1)||k)&&I(a),x&&(g=":",c=Ee),y=y||n&&!i;var A=(d||n)&&[[]],T="",V="",R="",M="",$="",N="",E="",F="",S=!y&&!g;u=u||(_=_||"#data",g),o(C),v=C+a.length,b?f&&m.push(["*","\n"+_.replace(/^:/,"ret+= ").replace(ye,"$1")+";\n"]):u?("else"===u&&(Ce.test(_)&&I('for "{{else if expr}}" use "{{else expr}}"'),A=w[7]&&[[]],w[8]=e.substring(w[8],C),w=h.pop(),m=w[2],S=!0),_&&O(_.replace(_e," "),A,t).replace(je,function(e,t,n,r,i,o,s,a){return r="'"+i+"':",s?(V+=o+",",M+="'"+a+"',"):n?(R+=r+o+",",N+=r+"'"+a+"',"):t?E+=o:("trigger"===i&&(F+=o),T+=r+o+",",$+=r+"'"+a+"',",p=p||Re.test(i)),""}).slice(0,-1),A&&A[0]&&A.pop(),l=[u,c||!!r||p||"",S&&[],J(M||(":"===u?"'#data',":""),$,N),J(V||(":"===u?"data,":""),T,R),E,F,A||0],m.push(l),S&&(h.push(w),w=l,w[8]=v)):j&&(s(j!==w[0]&&"else"!==w[0]&&j,w[0]),w[8]=e.substring(w[8],C),w=h.pop()),s(!w&&j),m=w[2]}var d,u,l,p,c,f=de.allowCode||t&&t.allowCode||le.allowCode===!0,g=[],v=0,h=[],m=g,w=[,,g];if(f&&(t.allowCode=f),n&&(void 0!==r&&(e=e.slice(0,-r.length-2)+ge),e=pe+e+ge),s(h[0]&&h[0][2].pop()[0]),e.replace(G,a),o(e.length),(v=g[g.length-1])&&s(""+v!==v&&+v[8]===v[8]&&v[0]),n){for(u=B(g,e,n),c=[],d=g.length;d--;)c.unshift(g[d][7]);q(u,c)}else u=B(g,t);return u}function q(e,t){var n,r,i=0,o=t.length;for(e.deps=[];o>i;i++){r=t[i];for(n in r)"_jsvto"!==n&&r[n].length&&(e.deps=e.deps.concat(r[n]))}e.paths=r}function J(e,t,n){return[e.slice(0,-1),t.slice(0,-1),n.slice(0,-1)]}function K(e,t){return"\n "+(t?t+":{":"")+"args:["+e[0]+"]"+(e[1]||!t?",\n    props:{"+e[1]+"}":"")+(e[2]?",\n    ctx:{"+e[2]+"}":"")}function O(e,t,n){function r(r,m,w,x,b,_,y,k,j,C,A,T,V,R,M,$,N,E,F,S){function q(e,n,r,s,a,d,p,c){var f="."===r;if(r&&(b=b.slice(n.length),/^\.?constructor$/.test(c||b)&&I(e),f||(e=(s?'view.hlp("'+s+'")':a?"view":"data")+(c?(d?"."+d:s?"":a?"":"."+r)+(p||""):(c=s?"":a?d||"":r,"")),e+=c?"."+c:"",e=n+("view.data"===e.slice(0,9)?e.slice(5):e)),u)){if(O="linkTo"===i?o=t._jsvto=t._jsvto||[]:l.bd,B=f&&O[O.length-1]){if(B._jsv){for(;B.sb;)B=B.sb;B.bnd&&(b="^"+b.slice(1)),B.sb=b,B.bnd=B.bnd||"^"===b.charAt(0)}}else O.push(b);h[g]=F+(f?1:0)}return e}x=u&&x,x&&!k&&(b=x+b),_=_||"",w=w||m||T,b=b||j,C=C||N||"";var J,K,O,B,L,Q=")";if("["===C&&(C="[j._sq(",Q=")]"),!y||d||a){if(u&&$&&!d&&!a&&(!i||s||o)&&(J=h[g-1],S.length-1>F-(J||0))){if(J=S.slice(J,F+r.length),K!==!0)if(O=o||p[g-1].bd,B=O[O.length-1],B&&B.prm){for(;B.sb&&B.sb.prm;)B=B.sb;L=B.sb={path:B.sb,bnd:B.bnd}}else O.push(L={path:O.pop()});$=ce+":"+J+" onerror=''"+fe,K=f[$],K||(f[$]=!0,f[$]=K=U($,n,!0)),K!==!0&&L&&(L._jsv=K,L.prm=l.bd,L.bnd=L.bnd||L.path&&L.path.indexOf("^")>=0)}return d?(d=!V,d?r:T+'"'):a?(a=!R,a?r:T+'"'):(w?(h[g]=F++,l=p[++g]={bd:[]},w):"")+(E?g?"":(c=S.slice(c,F),(i?(i=s=o=!1,"\b"):"\b,")+c+(c=F+r.length,u&&t.push(l.bd=[]),"\b")):k?(g&&I(e),u&&t.pop(),i=b,s=x,c=F+r.length,x&&(u=l.bd=t[i]=[]),b+":"):b?b.split("^").join(".").replace(xe,q)+(C?(l=p[++g]={bd:[]},v[g]=Q,C):_):_?_:M?(M=v[g]||M,v[g]=!1,l=p[--g],M+(C?(l=p[++g],v[g]=Q,C):"")):A?(v[g]||I(e),","):m?"":(d=V,a=R,'"'))}I(e)}var i,o,s,a,d,u=t&&t[0],l={bd:u},p={0:l},c=0,f=n?n.links:u&&(u.links=u.links||{}),g=0,v={},h={},m=(e+(n?" ":"")).replace(be,r);return!g&&m||I(e)}function B(e,t,n){var r,i,o,s,a,d,u,l,p,c,f,g,v,h,m,w,x,b,_,y,k,j,C,A,T,R,M,$,N,E,F=0,S=ue.useViews||t.useViews||t.tags||t.templates||t.helpers||t.converters,U="",J={},O=e.length;for(""+t===t?(b=n?'data-link="'+t.replace(_e," ").slice(1,-1)+'"':t,t=0):(b=t.tmplName||"unnamed",t.allowCode&&(J.allowCode=!0),t.debug&&(J.debug=!0),f=t.bnds,x=t.tmpls),r=0;O>r;r++)if(i=e[r],""+i===i)U+='\n+"'+i+'"';else if(o=i[0],"*"===o)U+=";\n"+i[1]+"\nret=ret";else{if(s=i[1],k=!n&&i[2],a=K(i[3],"params")+"},"+K(v=i[4]),$=i[5],E=i[6],j=i[8]&&i[8].replace(ye,"$1"),(T="else"===o)?g&&g.push(i[7]):(F=0,f&&(g=i[7])&&(g=[g],F=f.push(1))),S=S||v[1]||v[2]||g||/view.(?!index)/.test(v[0]),(R=":"===o)?s&&(o=s===Ee?">":s+o):(k&&(_=V(j,J),_.tmplName=b+"/"+o,_.useViews=_.useViews||S,B(k,_),S=_.useViews,x.push(_)),T||(y=o,S=S||o&&(!se[o]||!se[o].flow),A=U,U=""),C=e[r+1],C=C&&"else"===C[0]),N=$?";\ntry{\nret+=":"\n+",h="",m="",R&&(g||E||s&&s!==Ee)){if(M=new Function("data,view,j,u"," // "+b+" "+F+" "+o+"\nreturn {"+a+"};"),M._er=$,M._tag=o,n)return M;q(M,g),w='c("'+s+'",view,',c=!0,h=w+F+",",m=")"}if(U+=R?(n?($?"try{\n":"")+"return ":N)+(c?(c=void 0,S=p=!0,w+(g?(f[F-1]=M,F):"{"+a+"}")+")"):">"===o?(u=!0,"h("+v[0]+")"):(l=!0,"((v="+v[0]+")!=null?v:"+(n?"null)":'"")'))):(d=!0,"\n{view:view,tmpl:"+(k?x.length:"0")+","+a+"},"),y&&!C){if(U="["+U.slice(0,-1)+"]",w='t("'+y+'",view,this,',n||g){if(U=new Function("data,view,j,u"," // "+b+" "+F+" "+y+"\nreturn "+U+";"),U._er=$,U._tag=y,g&&q(f[F-1]=U,g),n)return U;h=w+F+",undefined,",m=")"}U=A+N+w+(F||U)+")",g=0,y=0}$&&(S=!0,U+=";\n}catch(e){ret"+(n?"urn ":"+=")+h+"j._err(e,view,"+$+")"+m+";}"+(n?"":"ret=ret"))}U="// "+b+"\nvar v"+(d?",t=j._tag":"")+(p?",c=j._cnvt":"")+(u?",h=j._html":"")+(n?";\n":',ret=""\n')+(J.debug?"debugger;":"")+U+(n?"\n":";\nreturn ret;"),de.debugMode!==!1&&(U="try {\n"+U+"\n}catch(e){\nreturn j._err(e, view);\n}");try{U=new Function("data,view,j,u",U)}catch(L){I("Compiled template code:\n\n"+U+'\n: "'+L.message+'"')}return t&&(t.fn=U,t.useViews=!!S),U}function L(e,t){return e&&e!==t?t?u(u({},t),e):e:t&&u({},t)}function Q(e){return Ne[e]||(Ne[e]="&#"+e.charCodeAt(0)+";")}function H(e){var t,n,r=[];if(typeof e===Fe)for(t in e)n=e[t],t===ee||te(n)||r.push({key:t,prop:n});return r}function P(e,n,r){var i=this.jquery&&(this[0]||S('Unknown template: "'+this.selector+'"')),o=i.getAttribute(Se);return N.call(o?t.data(i)[Ie]:re(i),e,n,r)}function D(e){return void 0!=e?Ve.test(e)&&(""+e).replace(Me,Q)||e:""}var Z=t===!1;t=t&&t.fn?t:e.jQuery;var z,G,W,X,Y,ee,te,ne,re,ie,oe,se,ae,de,ue,le,pe,ce,fe,ge,ve,he,me,we="v0.9.79",xe=/^(!*?)(?:null|true|false|\d[\d.]*|([\w$]+|\.|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,be=/(\()(?=\s*\()|(?:([([])\s*)?(?:(\^?)(!*?[#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*:?\/]|(=))\s*|(!*?[#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*(([)\]])(?=\s*[.^]|\s*$|[^([])|[)\]])([([]?))|(\s+)/g,_e=/[ \t]*(\r\n|\n|\r)/g,ye=/\\(['"])/g,ke=/['"\\]/g,je=/(?:\x08|^)(onerror:)?(?:(~?)(([\w$_\.]+):)?([^\x08]+))\x08(,)?([^\x08]+)/gi,Ce=/^if\s/,Ae=/<(\w+)[>\s]/,Te=/[\x00`><"'&=]/g,Ve=/[\x00`><\"'&=]/,Re=/^on[A-Z]|^convert(Back)?$/,Me=Te,$e=0,Ne={"&":"&amp;","<":"&lt;",">":"&gt;","\x00":"&#0;","'":"&#39;",'"':"&#34;","`":"&#96;","=":"&#61;"},Ee="html",Fe="object",Se="data-jsv-tmpl",Ie="jsvTmpl",Ue="For #index in nested block use #getIndex().",qe={},Je=e.jsrender,Ke=Je&&t&&!t.render,Oe={template:{compile:j},tag:{compile:y},viewModel:{compile:T},helper:{},converter:{}};if(Y={jsviews:we,sub:{View:b,Err:d,tmplFn:U,parse:O,extend:u,extendCtx:L,syntaxErr:I,onStore:{},addSetting:M,settings:{allowCode:!1},advSet:s,_ths:i,_tg:function(){},_cnvt:h,_tag:x,_er:S,_err:F,_html:D,_sq:function(e){return"constructor"===e&&I(""),e}},settings:{delimiters:l,advanced:function(e){return e?(u(ue,e),ae.advSet(),le):ue}},map:$},(d.prototype=new Error).constructor=d,c.depends=function(){return[this.get("item"),"index"]},f.depends="index",b.prototype={get:p,getIndex:f,getRsc:w,getTmpl:v,hlp:g,_is:"view"},ae=Y.sub,le=Y.settings,!(Je||t&&t.render)){for(z in Oe)R(z,Oe[z]);ie=Y.converters,oe=Y.helpers,se=Y.tags,ae._tg.prototype={baseApply:k,cvtArgs:m},X=ae.topView=new b,t?(t.fn.render=P,ee=t.expando,t.observable&&(u(ae,t.views.sub),Y.map=t.views.map)):(t={},Z&&(e.jsrender=t),t.renderFile=t.__express=t.compile=function(){throw"Node.js: use npm jsrender, or jsrender-node.js"},t.isFunction=function(e){return"function"==typeof e},t.isArray=Array.isArray||function(e){return"[object Array]"==={}.toString.call(e)},ae._jq=function(e){e!==t&&(u(e,t),t=e,t.fn.render=P,delete t.jsrender,ee=t.expando)},t.jsrender=we),de=ae.settings,de.allowCode=!1,te=t.isFunction,ne=t.isArray,t.render=qe,t.views=Y,t.templates=re=Y.templates;for(he in de)M(he);(le.debugMode=function(e){return void 0===e?de.debugMode:(de.debugMode=e,de.onError=e+""===e?new Function("","return '"+e+"';"):te(e)?e:void 0,le)})(!1),ue=de.advanced={useViews:!1,_jsv:!1},se({"if":{render:function(e){var t=this,n=t.tagCtx,r=t.rendering.done||!e&&(arguments.length||!n.index)?"":(t.rendering.done=!0,t.selected=n.index,n.render(n.view,!0));return r},flow:!0},"for":{render:function(e){var t,n=!arguments.length,r=this,i=r.tagCtx,o="",s=0;return r.rendering.done||(t=n?i.view.data:e,void 0!==t&&(o+=i.render(t,n),s+=ne(t)?t.length:1),(r.rendering.done=s)&&(r.selected=i.index)),o},flow:!0},props:{baseTag:"for",dataMap:$(H),flow:!0},include:{flow:!0},"*":{render:o,flow:!0},":*":{render:o,flow:!0},dbg:oe.dbg=ie.dbg=a}),ie({html:D,attr:D,url:function(e){return void 0!=e?encodeURI(""+e):null===e?e:""}})}return de=ae.settings,le.delimiters("{{","}}","^"),Ke&&Je.views.sub._jq(t),t||Je},window);

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

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
        },
        escape: function(html) {
            return html
                .replace(/&/g, '&amp;')
                .replace(/</g, '&alt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
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
                        '<div class="bt-text bt-flex bt-hbox">'+
                            '<input type="text" value="{{>text}}">'+
                        '</div>'+
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
            this._editing = $([]);
            this._initComponent();
            this._initEvents();

            this.fire('init');
        },
        /** @private */
        _initComponent: function () {
            var options = this.options, fields = options.fields;

            this.element.addClass('bigtree').attr('tabindex', 1);
            this.grid = $('<div class="bt-grid">').appendTo(this.element);
            this.masker = $(this.options.masker);
            
            // setup template
            this._setupTemplate();

            // init sortable
            this.element.sortable({
                items: '.bt-node',
                handle: '.bt-drag',
                // grid: [this.options.stepSize, 1],
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
            
            this.element.on('click.bt.edit', '.bt-text input', $.proxy(function(e){
                e.stopPropagation();
                var node = $(e.currentTarget).closest('.bt-node');
                this._startEdit(node);
            }, this));

            this.element.on('change.bt.edit', '.bt-text input', $.proxy(function(e){
                var detach = $(e.currentTarget).is(':focus') ? false : true;
                this._stopEdit(detach);
            }, this));

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
            var fields = this.options.fields, root = null, last, i;
            
            start = start === undef ? 0 : start;
            stop  = stop  === undef ? this._data.length : stop;

            if (start > 0 && (last = this._data[start - 1])) {
                root = last._root || null;
            }

            for (i = start; i < stop; i++) {
                var 
                    cur = this._data[i],
                    key = cur[fields.id];

                // actualy prepare for metadata
                cur._elbows = '';
                cur._level  = 0;

                // render number
                cur._number = -1;
                cur._metachanged = true;

                if (+cur[fields.level] === 0) {

                    if (root) {
                        root._last = false;
                    }
                    
                    cur._root   = null;
                    cur._parent = null;
                    cur._last   = true;
                    cur._hidden = false;
                    cur._match  = false;

                    // <!-- CUSTOM -->
                    if ( ! cur._builded) {
                        cur[fields.expand] = '0';    
                    }
                    // <!-- END CUSTOM -->
                    
                    root = cur;

                } else  {
                    var pid = cur[fields.path].split('/'), par, lst, n;

                    pid.pop();
                    pid = pid.pop();

                    par = this._data[this._indexes[pid]];

                    if ( ! par) {
                        throw new Error("Parent not found, invalid tree structure");
                    }

                    par._child = par._child || [];

                    n = _h.indexof(par._child, key);

                    if (n > -1) {
                        par._child.splice(n, 1);
                    }

                    lst = this._data[this._indexes[_h.lastof(par._child)]];

                    if (lst) lst._last = false;

                    cur._root   = root;
                    cur._parent = par;
                    cur._last   = true;
                    cur._hidden = +par[fields.expand] === 0 || par._hidden;

                    cur._match  = false;

                    par._child.push(cur[fields.id]);
                    par[fields.leaf] = '0';
                    par._metachanged = true;
                }

                cur._builded = true;
            }
        },
        /** @private */
        _renderRange: function (stacks, start, end, type, cleanup, focus) {
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
            this._ranges  = [start, end];
            this._visible = range;

            // ensure, metadata before start is changed
            var rsize = range.length, data, pick, i, j, p;

            // prepare render
            for (i = 0; i < rsize; i++) {
                data = range[i];
                pick = false;

                // assign number;
                data._number = (start + i);

                // escape html
                // data[fields.text] = _h.escape(data[fields.text]);

                if ((type == RENDER_APPEND && data._number >= xranges[1]) || 
                        (type == RENDER_PREPEND && data._number < xranges[0]) || 
                            cleanup) {
                    pick = true;
                }

                // request to render
                if (pick) {
                    render.push(data);

                    if (data._metachanged) {
                        data._metachanged = false;
                        data._elbows = this._elbows(data);
                    }

                    // attach plugins
                    if (data.plugins === undef) {
                        data.plugins = {};
                        for (j = 0; j < psize; j++) {
                            p = $.extend({}, plugins[j]);
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
                this._decorate(focus);
            }

            this._renderPlugins(render);
            this.fire('render', render);

            suspend = null;
            remove = null;
            render = null;
        },
        /** @private */
        _decorate: $.debounce(100, function (focus) { 
            if (this._selected) {
                var snode = this.grid.find('.bt-node[data-id='+this._selected+']');
                if (snode.length) {
                    this.select(snode);
                    if (focus) {
                        this.element.focus();    
                    }
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

            // Jika target adalah keturunannya data
            if (this.isdescendant(data, target)) {
                this._error(action + "(): can't move to descendant");
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
                        this._error("append(): nothing to append");
                        return false;
                    }

                    if ( ! this.isexpanded(target) && ! this.isleaf(target)) {
                        this._error("append(): can't append to collapsed data");
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
        _move: function (data, descs, action, target, silent, render) {
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
                        target[fields.expand] = '1';
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
                        // d._parent._child = [];
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
        _insert: function (data, action, target, silent, render) {
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
                    
                    child = target._child || [];

                    if (child.length) {
                        dindex = this.index(this.get(child[child.length - 1])) + 1;
                    } else {
                        dindex = this.index(target) + 1;
                    }

                    bindex = this.index(target);

                    target._child = [];

                    target[fields.leaf] = '0';
                    target[fields.expand] = '1';
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
            render = render === undef ? true : render;

            if (this.isvisible(target)) {
                this.render(RENDER_APPEND, true, false);
                this.flash(data);

                if ( ! silent) {
                    this.fire('insert', data, action, target);
                }
            } else if (render) {
                if ( ! this.isvisible(target)) {
                    this.scroll(target, $.proxy(function(){
                        this.render(RENDER_APPEND, true, false);
                        this.flash(data);

                        if ( ! silent) {
                            this.fire('insert', data, action, target);    
                        }
                    }, this));
                }
            }

        },
        /** @private */
        _startEdit: function (node, caret) {
            var 
                fields = this.options.fields,
                data = this.dataof(node),
                text = data[fields.text];

            if (this._editing[0] === node[0]) {
                return;
            }

            var evt = $.Event('beforeedit.bt');
            
            this.fire(evt, data, node);

            if (evt.isDefaultPrevented()) {
                evt = null;
                return;
            }

            evt = null;

            // make selection
            this.select(node);
            this._editing = node;

            var input = node.find('.bt-text input');

            if ( ! input.is(':focus')) {
                input.focus();
                _h.seltext(input, text.length, text.length);
            }
        },
        /** @private */
        _stopEdit: function (detach) {
            var 
                fields = this.options.fields,
                node = this._editing;

            if (node.length && node.is(':visible')) {
                var 
                    data = this.dataof(node),
                    text = node.find('.bt-text input').val(),
                    spec = {};

                if (text != data[fields.text]) {
                    spec[fields.text] = text;
                    this.update(data, text);
                }
            }

            detach = detach === undef ? true : detach;

            if (detach) {
                this._editing = $([]);
            }

        },
        /** @private */
        _elbows: function(data) {
            var
                fields = this.options.fields,
                elbows = '',
                lines = [],
                level = +data[fields.level],
                owner = data._parent;

            var icon, i;

            while(owner) {
                lines[owner[fields.level]] = owner._last ? 0 : 1;
                owner = owner._parent;
            }
            
            for (i = 0; i <= level; i++) {
                if (i === level) {
                    icon = +data[fields.leaf] === 0 
                        ? '<span class="elbow-expander ' + (+data[fields.expand] === 1 ? 'elbow-minus' : 'elbow-plus') + '"></span>' 
                        : '';
                    elbows += '<div class="bt-node-elbow elbow-end">'+icon+'</div>';
                } else {
                    elbows += '<div class="bt-node-elbow '+(lines[i] === 1 ? 'elbow-line' : '')+'"></div>';
                }
            }

            return elbows;
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
                start = this._data.length;

            var stop;


            // concat array, 
            // use `push.apply()` rather than `concat` to keep reference
            this._data.push.apply(this._data, (data || []));
            stop = this._data.length;

            this._reindex(start, stop);
            this._rebuild(start, stop);

            render = render === undef ? false : render;
            render && this.render(RENDER_APPEND, false);
        },
        render: function (type, cleanup, focus) {
            var 
                buffer = this._buffer,
                height = this.element.height(),
                offset = 0 - this.grid.position().top,
                stacks = $.grep(this._data, function(d){ return ! d._hidden; });

            var begpix, endpix;

            type = type === undef ? RENDER_APPEND : type;
            cleanup = cleanup === undef ? false : cleanup;
            focus = focus === undef ? true : focus;

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

            this._renderRange(stacks, begrow, endrow, type, cleanup, focus);
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
            var fields = this.options.fields;
            data[fields.text] = text;
            
            var node = this.nodeof(data);
            
            if (node.length) {
                var input = node.find('.bt-text input');
                if (input.val() != text) {
                    input.val(text);
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

            this.render(RENDER_APPEND, true, false);

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
                    node = this.nodeof(data),
                    visible = node.length;

                cascade = cascade === undef ? true : cascade;

                if (visible) {
                    this.deselect(node);
                }

                if (cascade) {
                    var 
                        removed = this.descendants(data), 
                        owner = data._parent,
                        prev = this.prev(data);

                    var bstart, child, size, key, i;

                    bstart = owner ? this.index(owner) : (prev ? this.index(prev) : offset);
                    
                    removed.unshift(data);
                    size = removed.length;

                    for (i = size - 1; i >= 0; i--) {
                        delete this._indexes[removed[i][fields.id]];
                    }

                    this._data.splice(offset, size);
                    this._reindex(bstart);

                    if (owner) {
                        child = owner._child || [];
                        if (child.length) {
                            var pos = _h.indexof(child, data[fields.id]);
                            child.splice(pos, 1);
                            if ( ! child.length) {
                                owner[fields.leaf] = '1';
                            }
                        }
                    }   

                    this._rebuild(bstart);
                    
                    silent = silent === undef ? false : silent;
                    
                    if ( ! silent) {
                        this.fire('dispose', data);    
                    }

                    if (visible) {
                        this.render(RENDER_APPEND, true);
                    }
                }
                return true;
            }
            return false;
        },
        append: function (owner, data, silent, render) {
            if (this._isvalid(data, 'append', owner)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'append', owner, silent, render);
                } else {
                    var desc = this.descendants(data);
                    this._revoke(data, desc);
                    this._move(data, desc, 'append', owner, silent, render);
                }

                return true;
            }

            return false;
        },
        before: function (next, data, silent, render) {
            if (this._isvalid(data, 'before', next)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'before', next, silent, render);
                } else {
                    var desc = this.descendants(data);
                    this._revoke(data, desc);
                    this._move(data, desc, 'before', next, silent, render);
                }
                return true;
            }

            return false;
        },
        after: function (prev, data, silent, render) {
            if (this._isvalid(data, 'after', prev)) {
                if (this.isphantom(data)) {
                    this._insert(data, 'after', prev, silent, render);
                } else {
                    var desc = this.descendants(data);
                    this._revoke(data, desc);
                    this._move(data, desc, 'after', prev, silent, render);
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
        isancestor: function (offset, target) {
            if (offset._root === target._root) {
                return this.left(target) < this.left(offset);
            }
            return false;
        },
        isdescendant: function (offset, target) {
            return this.left(target) > this.left(offset) && this.right(target) < this.right(offset);
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
        suppress: function(data) {
            var 
                me = this,
                datas = [data].concat(me.descendants(data)),
                size = datas.length;

            while(size--) {
                var curr = datas[size];
                curr._suppress = true;
            }

            this.fire('suppress', data);
        },
        reveal: function(data) {

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
            this._stopEdit();

            this._selected = null;
            node.removeClass('bt-selected');
        },
        deselectAll: function () {
            this._stopEdit();

            this._selected = null;
            this.grid.children('.bt-selected').removeClass('bt-selected');
        },
        selection: function () {
            var node = this.grid.children('.bt-selected');
            return node.length ? this._data[this._indexes[this._selected]] : null;
        },
        query: function (query) {

            if (query) {
                query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }

            var 
                fields = this.options.fields,
                regex = new RegExp(query, 'igm'),
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

                    var found = (text || '').match(regex);

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
            
            if (_h.indexof([9, 37, 38, 39, 40], code) > -1) {
                var 
                    fields = this.options.fields,
                    node = this.grid.find('.bt-selected'),
                    ndat = this.dataof(node);

                var next, prev, pdat;

                if (node.length) {
                    switch(code) {
                        // tab
                        case 9:
                            e.preventDefault();

                            if (e.shiftKey) {
                                prev = node.prev('.bt-node');

                                while(prev.length) {
                                    pdat = this.dataof(prev);
                                    if (+pdat[fields.level] < +ndat[fields.level]) {
                                        break;
                                    } else {
                                        pdat = null;
                                    }
                                    prev = prev.prev('.bt-node');
                                }

                                if (pdat) {
                                    this.after(pdat, ndat);
                                }
                            } else {
                                pdat = this.prev(ndat);
                                if (pdat) {
                                    this.append(pdat, ndat);
                                }
                            }
                            break;

                        // left
                        case 37:
                            if (e.shiftKey && e.ctrlKey && e.altKey) {
                                e.preventDefault();
                                this.collapse(ndat);
                            }
                            break;

                        // up
                        case 38:
                            if (e.shiftKey && e.ctrlKey && e.altKey) {
                                e.preventDefault();
                                prev = node.prev('.bt-node');
                                if (prev.length) {
                                    this.before(this.dataof(prev), ndat);
                                }
                            } else {
                                prev = node.prev('.bt-node');
                                if (prev.length) this._startEdit(prev);    
                            }
                            break;

                        // right
                        case 39:
                            if (e.shiftKey && e.ctrlKey && e.altKey) {
                                e.preventDefault();
                                this.expand(ndat);
                            }
                            break;

                        // down
                        case 40:
                            if (e.shiftKey && e.ctrlKey && e.altKey) {
                                e.preventDefault();
                                next = node.next('.bt-node');
                                if (next.length) {
                                    this.after(this.dataof(next), ndat);
                                }
                            } else {
                                next = node.next('.bt-node');
                                if (next.length) this._startEdit(next);
                            }
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
                    return ['after', siblings[0], current];
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
                    this.render(RENDER_APPEND, true);
                }
            } else {
                this.render(RENDER_APPEND, true);
            }
        },
        _error: function (message) {
            this._message = message;
            if (this.options.debug) {
                console.warn(message);
            }
        },
        empty: function() {
            this._data    = [];
            this._indexes = {};
            this._ranges  = [0, 0];
            this._visible = [];
            this._message = '';
            this._selected = null;

            this.grid.empty();
            this.grid.css({paddingTop: 0, paddingBottom: 0});
        },
        destroy: function (remove) {
            this.element.off('.bt');
            this.element.sortable('destroy');
            
            $.removeData(this.element[0], 'bigtree');

            this._data = null;
            this._indexes = null;
            this._selected = null;

            if (remove !== undef && remove === true) {
                this.masker.remove();
                this.masker = null;
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
                options = init ? options : {};
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