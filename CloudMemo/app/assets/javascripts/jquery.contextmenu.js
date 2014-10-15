/*
 * ContextMenu - jQuery plugin for right-click context menus
 *
 * Author: Chris Domigan
 * Contributors: Dan G. Switzer, II
 * Parts of this plugin are inspired by Joern Zaefferer's Tooltip plugin
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Version: r2
 * Date: 16 July 2007
 *
 * For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
 *
 */

(function($) {

  var menu, shadow, trigger, content, hash, currentTarget;
  var globalDisabledItems = {};
  var timeoutID = null;
  var defaults = {
    menuStyle: {
      listStyle: 'none',
      padding: '2px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: '100px'
    },
    itemStyle: {
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
    },
    itemHoverStyle: {
      border: '1px solid #0a246a',
      backgroundColor: '#b6bdd2'
    },
    eventPosX: 'pageX',
    eventPosY: 'pageY',
    shadow : true,
    onContextMenu: null,
    onShowMenu: null,
    disabledItems: {}
  };

  $.fn.contextMenu = function(id, options) {
    if (!menu) {                                      // Create singleton menu
      menu = $('<div id="jqContextMenu"></div>')
               .hide()
               .css({position:'absolute', zIndex:'500'})
               .appendTo('body')
               .bind('click', function(e) {
                 e.stopPropagation();
               });
    }
    if (!shadow) {
      shadow = $('<div></div>')
                 .css({backgroundColor:'#000',position:'absolute',opacity:0.2,zIndex:499})
                 .appendTo('body')
                 .hide();
    }
    hash = hash || [];
    hash.push({
      id : id,
      menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
      itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
      itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
      bindings: options.bindings || {},
      shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
      onContextMenu: options.onContextMenu || defaults.onContextMenu,
      onShowMenu: options.onShowMenu || defaults.onShowMenu,
      eventPosX: options.eventPosX || defaults.eventPosX,
      eventPosY: options.eventPosY || defaults.eventPosY,
      disabledItems: options.disabledItems || {},
      disableMenuItems: function (selector, context) {
        if(context === undefined){
          context = $('#' + this.id);
        }
        addIDs(this.disabledItems, selector, context);
      },
      enableMenuItems: function (selector, context) {
        if(context === undefined){
          context = $('#' + this.id);
        }
        deleteIDs(this.disabledItems, selector, context);
      }
    });

    var index = hash.length - 1;
    $(this).bind('contextmenu taphold', function(e) {
      // Check if onContextMenu() defined
      var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
      if (bShowContext === undefined) bShowContext = true; // default true
      if (bShowContext) display(index, this, e, options);
      return false;
    });
    return this;
  };

  function display(index, trigger, e, options) {
    var cur = hash[index];
    var menuId = cur.id;
    content = $('#'+cur.id).find('ul:first').clone(true);
    content.css(cur.menuStyle).find('li:not(.separator)').css(cur.itemStyle).hover(
      function() {
        $(this).css(cur.itemHoverStyle);
      },
      function(){
        $(this).css(cur.itemStyle);
      }
    ).find('img').css({verticalAlign:'middle',paddingRight:'2px'});

    // Send the content to the menu
    menu.html(content);

    // if there's an onShowMenu, run it now -- must run after content has been added
		// if you try to alter the content variable before the menu.html(), IE6 has issues
		// updating the content
    if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

    var gdi = globalDisabledItems[menuId] || {};
    var cdi = cur.disabledItems[menuId] || {};

    $.each(cur.bindings, function(id, func) {
      if((!gdi[id]) && (!cdi[id])){
        $('#'+id, menu).bind('click', function(e) {
          hide();
          func(trigger, currentTarget);
        });
      }else{
        // grayout disabled item
        $('#'+id, menu).css('opacity', 0.35);
      }
    });

    var menu_left = e[cur.eventPosX];
    var menu_top = e[cur.eventPosY];
    if (e.type == "taphold") {
        /* ロングタップで表示する場合、誤操作を防ぐためにメニュー表示位置をずらす */
        menu_left += 16;
    }

    menu.css({'left': menu_left,'top': menu_top}).show().bgiframe();
    if (cur.shadow) shadow.css({width:menu.width(),height:menu.height(),left:menu_left+2,top:menu_top+2}).show();

    /* コンテキストメニュー以外の場所をクリックorタップしたらメニューを隠す */
    if (e.type == 'taphold') {
        var one_handler = function(e) {
            if ($(e.target).parents("#jqContextMenu").length > 0){
                $(document).one('touchstart', one_handler);
            } else {
                hide();
            }
        }
        $(document).one('touchstart', one_handler);
    } else {
        $(document).one('click', hide);
    }

  }

  function hide() {
    menu.hide();
    shadow.hide();
  }

  function addIDs(ids, selector, context) {
    if(selector === undefined){
      selector = 'li';

      if(context === undefined){
        context = $('div.contextMenu');
      }
    }

    $(selector, context).each(function() {
      var itemId = $(this).attr('id');
      var menuId = $(this).parent().parent().attr('id');
      if(itemId && menuId){
        if(!ids[menuId]){
          ids[menuId] = {};
        }
        ids[menuId][itemId] = true;
      }
    });
  }

  function deleteIDs(ids, selector, context) {
    var i;
    if(selector === undefined){
      for(i in ids){
        if(ids.hasOwnProperty(i)){
          delete ids[i];
        }
      }
      return;
    }

    $(selector, context).each(function() {
      var itemId = $(this).attr('id');
      var menuId = $(this).parent().parent().attr('id');
      if(itemId && menuId){
        if(ids[menuId] && ids[menuId][itemId])
        delete ids[menuId][itemId];
      }
    });
  }

  // Apply defaults
  $.contextMenu = {
    defaults : function(userDefaults) {
      $.each(userDefaults, function(i, val) {
        if (typeof val == 'object' && defaults[i]) {
          $.extend(defaults[i], val);
        }
        else defaults[i] = val;
      });
    },
    disableMenuItems: function(selector, context) {
      addIDs(globalDisabledItems, selector, context);
    },
    enableMenuItems: function(selector, context) {
      deleteIDs(globalDisabledItems, selector, context);
    }
  };

  // hide context menu forcibly.
  $.contextMenu.hide = function() {
    if (menu) menu.hide();
    if (shadow) shadow.hide();
  };

  // clear context menu data
  $.contextMenu.clear = function() {
    if(hash) hash = [];
  };
})(jQuery);

$(function() {
  $('div.contextMenu').hide();
});
