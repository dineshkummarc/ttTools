/*

	jQuery Tags Input Plugin 1.3.3
	
	Copyright (c) 2011 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

	var delimiter = new Array();
	var tags_callbacks = new Array();
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));
	
	    if (val === (val = input.val())) {return;}
	
	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);
	
	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };
  
	$.fn.addTag = function(value,options) {
			options = jQuery.extend({focus:false,callback:true},options);
			this.each(function() { 
				var id = $(this).attr('id');

				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}

				value = jQuery.trim(value);
		
				if (options.unique) {
					var skipTag = $(tagslist).tagExist(value);
					if(skipTag == true) {
					    //Marks fake input as not_valid to let styling it
    				    $('#'+id+'_tag').addClass('not_valid');
    				}
				} else {
					var skipTag = false; 
				}
				
				if (value !='' && skipTag != true) { 
                    $('<span>').addClass('tag').append(
                        $('<span>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : 'Removing tag',
                            text  : 'x'
                        }).click(function () {
                            return $('#' + id).removeTag(escape(value));
                        })
                    ).insertBefore('#' + id + '_addTag');

					tagslist.push(value);
				
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {		
						$('#'+id+'_tag').blur();
					}
					
					$.fn.tagsInput.updateTagsField(this,tagslist);
					
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
						var f = tags_callbacks[id]['onAddTag'];
						f.call(this, value);
					}
					if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
					{
						var i = tagslist.length;
						var f = tags_callbacks[id]['onChange'];
						f.call(this, $(this), tagslist[i-1]);
					}					
				}
		
			});		
			
			return false;
		};
		
	$.fn.removeTag = function(value) { 
			value = unescape(value);
			this.each(function() { 
				var id = $(this).attr('id');
	
				var old = $(this).val().split(delimiter[id]);
					
				$('#'+id+'_tagsinput .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (old[i]!=value) { 
						str = str + delimiter[id] +old[i];
					}
				}
				
				$.fn.tagsInput.importTags(this,str);

				if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
					var f = tags_callbacks[id]['onRemoveTag'];
					f.call(this, value);
				}
			});
					
			return false;
		};
	
	$.fn.tagExist = function(val) {
		return (jQuery.inArray(val, $(this)) >= 0); //true when tag exists, false when not
	};
	
	// clear all existing tags and import new ones from a string
	$.fn.importTags = function(str) {
                id = $(this).attr('id');
		$('#'+id+'_tagsinput .tag').remove();
		$.fn.tagsInput.importTags(this,str);
	}
		
	$.fn.tagsInput = function(options) { 
    var settings = jQuery.extend({
      interactive:true,
      defaultText:'add a tag',
      minChars:0,
      width:'300px',
      height:'100px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();				
			}
				
			var id = $(this).attr('id')
			
			var data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);
	
			delimiter[id] = data.delimiter;
			
			if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
				tags_callbacks[id] = new Array();
				tags_callbacks[id]['onAddTag'] = settings.onAddTag;
				tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
				tags_callbacks[id]['onChange'] = settings.onChange;
			}
	
			var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';
			
			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
			}
			
			markup = markup + '</div><div class="tags_clear"></div></div>';
			
			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			$(data.holder).css('height',settings.height);
	
			if ($(data.real_input).val()!='') { 
				$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
			}		
			if (settings.interactive) { 
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);
		
				$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});
			
				$(data.fake_input).bind('focus',data,function(event) {
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) { 
						$(event.data.fake_input).val('');
					}
					$(event.data.fake_input).css('color','#000000');		
				});
						
				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) { 
						autocomplete_options[attrname] = settings.autocomplete[attrname]; 
					}
				
					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}
				
					
				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) { 
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});
				
				}
				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
					    event.preventDefault();
						if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
					  	$(event.data.fake_input).resetAutosize(settings);
						return false;
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);
            
          			}
				});
				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 var id = $(this).attr('id').replace(/_tag$/, '');
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 $('#' + id).removeTag(escape(last_tag));
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();
				
				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('not_valid');
				        }
				    });
				}
			} // if settings.interactive
			return false;
		});
			
		return this;
	
	};
	
	$.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		var id = $(obj).attr('id');
		$(obj).val(tagslist.join(delimiter[id]));
	};
	
	$.fn.tagsInput.importTags = function(obj,val) {			
		$(obj).val('');
		var id = $(obj).attr('id');
		var tags = val.split(delimiter[id]);
		for (i=0; i<tags.length; i++) { 
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
		{
			var f = tags_callbacks[id]['onChange'];
			f.call(obj, obj, tags[i]);
		}
	};

})(jQuery);
ttObjects = {
  room : null,
  getRoom : function() {
    for (var memberName in turntable) {
      var member = turntable[memberName];
      if (typeof member !== 'object' || member === null) continue;
      if (typeof member.setupRoom !== 'undefined') {
        ttObjects.room = member;
        return member;
      }
    }
    return false;
  },

  manager : null,
  getManager : function() {
    for (var memberName in ttObjects.getRoom()) {
      var member = ttObjects.room[memberName];
      if (typeof member !== 'object' || member === null) continue;
      if (typeof member.blackswan !== 'undefined') {
        ttObjects.manager = member;
        return member;
      }
    }
    return false;
  }
};ttTools = {

  // This shit needs to go... There's got to be a better way...
  loadRetry : 30,
  load : function (retry) {
    if (!turntable || !ttObjects.getManager()) {
      if (retry > ttTools.loadRetry) { return alert('Could not load ttTools.'); }
      var callback = function () { ttTools.load(retry++); }
      return setTimeout(callback, 1000);
    }
    ttTools.init();
  },

  init : function() {
    $('<link/>', {
      type : 'text/css',
      rel  : 'stylesheet',
      href : 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.1/themes/sunny/jquery-ui.css'
    }).appendTo(document.head);

    this.roomChanged();
    this.userActivityLog.init();

    this.views.menu.render();
    this.views.toolbar.render();
    this.views.users.render();

    // TODO: Cloudify tags
    this.tags.load(0);

    // Register event listeners
    turntable.addEventListener('auth', $.proxy(this.authEvent, this));
    turntable.addEventListener('message', $.proxy(this.messageEvent, this));
    turntable.addEventListener('reconnect', $.proxy(this.reconnectEvent, this));
    turntable.addEventListener('userinfo', $.proxy(this.userInfoEvent, this));

    this.checkVersion();
  },

  // Event listeners
  authEvent : function (message) {
    console.warn(message);
  },

  messageEvent : function (message) {
    if (typeof message.msgid !== 'undefined') return;

    switch (message.command) {
      case 'speak':
        return this.userSpoke(message);
        break;
      case 'update_votes':
        return this.votesUpdated(message);
        break;
      case 'registered':
        return this.userAdded(message);
        break;
      case 'deregistered':
        return this.userRemoved(message);
        break;
      case 'newsong':
        return this.songChanged(message);
        break;
      case 'rem_dj':
        return this.djRemoved(message);
        break;
      case 'add_dj':
        return this.djAdded(message);
        break;
      case 'booted_user':
        return this.userBooted(message);
        break;
      case 'update_user':
        return this.userUpdated();
        break;
      case 'snagged':
        return this.songSnagged();
        break;
      default:
        return console.warn(message);
        break;
    }

    // Courtesy of Frick
    if (typeof message.users !== 'undefined'
      && typeof message.room === 'object'
      && typeof message.room.metadata === 'object'
      && typeof message.room.metadata.songlog !== 'undefined')
        return this.roomChanged();
  },

  reconnectEvent : function (message) {
    console.warn(message);
  },

  userInfoEvent : function (message) {
    console.warn(message);
  },

  // Event handlers
  djRemoved : function (message) {
    this.autoDJ.execute(message.user);
    // this.autoRoll.execute();
    this.views.users.update();
  },

  djAdded : function (message) {
    this.views.users.update();
  },

  roomChanged : function (message) {
    ttObjects.getManager(); // getManager also updates the room object
    this.autoDJ.setEnabled(false);
    // this.autoRoll.setEnabled(false);
    this.animations.setEnabled(this.animations.enabled());
    this.override_idleTime();
    this.override_guestListName();
    this.override_updateGuestList();
  },

  songChanged : function (message) {
    this.downVotes.downvoters = [];
    this.downVotes.downvotes = 0;
    this.views.users.update();
    this.autoVote.execute();
  },

  songSnagged : $.noop,

  userAdded : $.noop,

  userBooted : function (message) {
    delete this.userActivityLog[message.userid];
  },

  userRemoved : function (message) {
    $(message.user).each(function (index, user) {
      delete this.userActivityLog[user.userid];
    });
  },

  userSpoke : function (message) {
    this.userActivityLog[message.userid].message = util.now();
    this.views.users.updateUser(message.userid);
  },

  userUpdated : $.noop,

  votesUpdated : function (message) {
    this.downVotes.update(message.room.metadata);
    this.views.users.updateVoteCount();
  },

  // State machines
  autoVote : {
    enabled : function () {
      var enabled = $.cookie('ttTools_autoVote_enabled');
      if (enabled === null || enabled === 'false') return false;
      return enabled;
    },
    setEnabled : function (enabled) {
      $.cookie('ttTools_autoVote_enabled', enabled);
    },
    delay : function () {
      var delay = $.cookie('ttTools_autoVote_delay');
      return delay === null ? (30 * ttTools.constants.time.seconds) : parseInt(delay);
    },
    setDelay : function (delay) {
      $.cookie('ttTools_autoVote_delay', delay);
    },
    execute : function () {
      var enabled = this.enabled();
      if (enabled) {
        setTimeout(function() {
          turntable.whenSocketConnected(function() {
            ttObjects.room.connectRoomSocket(enabled);
          });
        }, this.delay());
      }
    }
  },

  autoDJ : {
    enabled : function () {
      var enabled = $.cookie('ttTools_autoDJ_enabled');
      return enabled === null ? false : enabled === 'true';
    },
    setEnabled : function (enabled) {
      $.cookie('ttTools_autoDJ_enabled', enabled);
    },
    delay : function () {
      var delay = $.cookie('ttTools_autoDJ_delay');
      return delay === null ? (2 * ttTools.constants.time.seconds) : parseInt(delay);
    },
    setDelay : function (delay) {
      $.cookie('ttTools_autoDJ_delay', delay);
    },
    execute : function (users) {
      var self = false;
      $(users).each(function (index, user) {
        if (user.userid === turntable.user.id) self = true;
      });
      if (this.enabled() && !self && !ttObjects.room.isDj()) {
        setTimeout(function () {
          if (ttObjects.room.numDjs() < ttObjects.room.maxDjs) {
            ttObjects.room.becomeDj();
            ttTools.autoDJ.setEnabled(false);
            ttTools.views.toolbar.update();
          }
        }, this.delay());
      }
    }
  },

  // Coming soon...
  // autoRoll : {
  //   enabled : function () {
  //     var enabled = $.cookie('ttTools_autoRoll_enabled');
  //     return enabled === null ? false : enabled === 'true';
  //   },
  //   setEnabled : function (enabled) {
  //     $.cookie('ttTools_autoRoll_enabled', enabled);
  //   },
  //   execute : function () {
  //     if (this.enabled()) {
  //       $('div.chatBar form.input-box input[type=text]').val('roll').submit();
  //     }
  //   },
  // },

  animations : {
    enabled : function () {
      var enabled = $.cookie('ttTools_animations_enabled');
      return enabled === null ? true : enabled === 'true';
    },
    setEnabled : function (enabled) {
      $.cookie('ttTools_animations_enabled', enabled);
      enabled ? ttTools.animations.enable() : ttTools.animations.disable();
    },
    enable : function () {
      if (ttObjects.manager.add_animation_to_ttTools)
        ttObjects.manager.add_animation_to = ttObjects.manager.add_animation_to_ttTools;
      if (ttObjects.manager.speak_ttTools)
        ttObjects.manager.speak = ttObjects.manager.speak_ttTools;

      $(Object.keys(ttObjects.manager.djs_uid)).each(function (index, uid) {
        var dancer = ttObjects.manager.djs_uid[uid][0];
        if (uid === ttObjects.room.currentDj)
          return ttObjects.manager.add_animation_to(dancer, 'bob');
        if ($.inArray(uid, ttObjects.room.upvoters) > -1)
          return ttObjects.manager.add_animation_to(dancer, 'rock');
      });

      $(Object.keys(ttObjects.manager.listeners)).each(function (index, uid) {
        var dancer = ttObjects.manager.listeners[uid];
        if ($.inArray(uid, ttObjects.room.upvoters) > -1)
          return ttObjects.manager.add_animation_to(dancer, 'rock');
      });
    },
    disable : function () {
      ttObjects.manager.add_animation_to_ttTools = ttObjects.manager.add_animation_to;
      ttObjects.manager.add_animation_to = $.noop;
      ttObjects.manager.speak_ttTools = ttObjects.manager.speak;
      ttObjects.manager.speak = $.noop;
      $(Object.keys(ttObjects.manager.djs_uid)).each(function (index, uid) {
        ttObjects.manager.djs_uid[uid][0].stop();
      });
      $(Object.keys(ttObjects.manager.listeners)).each(function (index, uid) {
        ttObjects.manager.listeners[uid].stop();
      });
    }
  },

  idleIndicator : {
    threshold : function () {
      var threshold = $.cookie('ttTools_idleIndicator_threshold');
      return threshold === null ? (60 * ttTools.constants.time.minutes) : parseInt(threshold);
    },
    setThreshold : function (threshold) {
      $.cookie('ttTools_idleIndicator_threshold', threshold);
    }
  },

  userActivityLog : {
    init : function () {
      var users = Object.keys(ttObjects.room.users);
      $(users).each(function (index, uid) {
        ttTools.userActivityLog.initUser(uid);
      });
    },

    initUser : function (uid) {
      if (typeof ttTools.userActivityLog[uid] === 'undefined') {
        ttTools.userActivityLog[uid] = {
          message : util.now(),
          vote    : util.now()
        }
      }
      return ttTools.userActivityLog[uid];
    },

    vote : function (uid) {
      var activity = ttTools.userActivityLog.initUser(uid);
      return activity.vote;
    },

    message : function (uid) {
      var activity = ttTools.userActivityLog.initUser(uid);
      return activity.message;
    },

    lastActivity : function (uid) {
      var activity = ttTools.userActivityLog.initUser(uid);
      var last = activity.vote > activity.message ? activity.vote : activity.message;
      return util.now() - last;
    }
  },

  downVotes : {
    downvotes : 0,
    downvoters : [],
    update : function (metadata) {
      this.downvotes = metadata.downvotes;
      $(metadata.votelog).each(function (index, vote) {
        if (vote[0] === '') return;
        ttTools.userActivityLog[vote[0]].vote = util.now();
        if (vote[1] === 'up') {
          var downIndex = $.inArray(vote[0], ttTools.downVotes.downvoters);
          if (downIndex > -1) { ttTools.downVotes.downvoters.splice(downIndex, 1); }
        } else {
          ttTools.downVotes.downvoters.push(vote[0]);
        }
        ttTools.views.users.updateUser(vote[0]);
      });
    }
  },

  // Overrides !! ONLY USE IF ABSOLUTELY NECESSARY !!
  override_guestListName : function () {
    Room.layouts.guestListName_ttTools = Room.layouts.guestListName;
    Room.layouts.guestListName = function (user, room, selected) {
      var tree = this.guestListName_ttTools(user, room, selected);
      var div = tree[0].split('.');
      div[0] += '#' + user.userid;
      tree[0] = div.join('.');
      return tree;
    }
  },
  override_updateGuestList : function () {
    ttObjects.room.updateGuestList_ttTools = ttObjects.room.updateGuestList;
    ttObjects.room.updateGuestList = function () {
      this.updateGuestList_ttTools();
      ttTools.views.users.update();
    }
  },
  override_idleTime : function () {
    turntable.idleTime = function () {
      return 0;
    };
  },

  // Utility functions
  checkVersion : function () {
    if (parseInt($.cookie('ttTools_release')) !== ttTools.release) {
      $.cookie('ttTools_release', ttTools.release);
      this.views.info.render();
    }
  },

  timestamp : function (millis) {
    millis = util.now() - millis;

    if (millis < ttTools.constants.time.minutes)
      return Math.round(millis / ttTools.constants.time.seconds) + 's';

    if (millis < ttTools.constants.time.hours)
      return Math.round(100 * (millis / ttTools.constants.time.minutes))/100 + 'm';

    if (millis < ttTools.constants.time.days)
      return Math.round(100 * (millis / ttTools.constants.time.hours))/100 + 'h';

    return Math.round(1000 * (millis / ttTools.constants.time.days))/1000 + 'd';
  }
}
ttTools.constants = {
  whatsNew : "\
    <h2>What's New in ttTTools?</h2>\
    <br />\
    <ul>\
      <li>Guestlist integration</li>\
      <li>New minified toolbar</li>\
      <li>New toggle animations capability</li>\
      <li>New auto-lame capability</li>\
      <li>New slider for guest list idle indicator threshold</li>\
      <li>Improved event-driven architecture</li>\
      <li>Implemented new ttObjects object cache for bookmarklet interoperability</li>\
      <li>Removed support for import/export, functionality (still available as an extra)</li>\
    </ul>\
  ",

  donateButton : "\
    <br />\
    <h3>Do you &lt;3 ttTools?</h3>\
    <form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_blank'>\
    <input type='hidden' name='cmd' value='_s-xclick'>\
    <input type='hidden' name='hosted_button_id' value='ZNTHAXPNKMKBN'>\
    <input type='image' src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'>\
    <img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'>\
    </form>\
    <br />\
  ",

  time : {
    seconds : 1000,
    minutes : 60 * 1000,
    hours   : 60 * 60 * 1000,
    days    : 24 * 60 * 60 * 1000,
    weeks   : 7 * 24 * 60 * 60 * 1000,
    months  : 30 * 7 * 24 * 60 * 60 * 1000,
    years   : 365 * 30 * 7 * 24 * 60 * 60 * 1000
  },

  hackers : [
    '4e55144e4fe7d02a3f2c486a' // Egeste
    // Frick
    // SubFuze
    // ???
  ]
}
ttTools.views = {

  // Dialogs
  menu : {
    render : function () {
      $('<div class="menuItem">ttTools</div>').click(function (e) {
        ttTools.views.settings.render();
      }).insertBefore($('div#menuh').children().last());
    }
  },

  settings : {
    render : function () {
      util.showOverlay(util.buildTree(this.tree()));
      $('div.settingsOverlay.modal').append(ttTools.constants.donateButton);

      $('<style/>', {
        type : 'text/css',
        text : "\
        div.field.settings { padding:10px 20px; }\
        div.field.settings .ui-slider {\
          height:0.5em;\
          margin:10px 0 3px;\
        }\
        div.field.settings .ui-slider .ui-slider-handle {\
          width:0.9em;\
          height:0.9em;\
        }\
        div#idleIndicatorDisplay, div#autoDJDisplay, div#autoVoteDisplay { text-align:center; }\
      "}).appendTo($('div.settingsOverlay.modal'));

      $('div#idleIndicatorThreshold').slider({
        min   : 10 * ttTools.constants.time.minutes,
        max   : 60 * ttTools.constants.time.minutes,
        step  : ttTools.constants.time.minutes,
        value : ttTools.idleIndicator.threshold(),
        slide : function (event, ui) {
          ttTools.idleIndicator.setThreshold(ui.value);
          $('div#idleIndicatorDisplay').text((ui.value / ttTools.constants.time.minutes) + 'm');
        }
      });

      $('div#autoDJDelay').slider({
        min   : 0,
        max   : 5 * ttTools.constants.time.seconds,
        step  : ttTools.constants.time.seconds / 10, // Tenths of a second
        value : ttTools.autoDJ.delay(),
        slide : function (event, ui) {
          ttTools.autoDJ.setDelay(ui.value)
          $('div#autoDJDisplay').text((ui.value / ttTools.constants.time.seconds) + 's');
        }
      });

      $('div#autoVoteDelay').slider({
        min   : 0,
        max   : 60 * ttTools.constants.time.seconds,
        step  : ttTools.constants.time.seconds,
        value : ttTools.autoVote.delay(),
        slide : function (event, ui) {
          ttTools.autoVote.setDelay(ui.value);
          $('div#autoVoteDisplay').text((ui.value / ttTools.constants.time.seconds) + 's');
        }
      });
    },

    tree : function () {
      return ['div.settingsOverlay.modal', {},
        ['div.close-x', {
          event : {
            click : util.hideOverlay
          }
        }],
        ['h1', 'ttTools'],
        ['div', {}, 'Released: ' + (new Date(ttTools.release * 1000)).toGMTString()],
        ['br'],
        ['div.fields', {},
          ['div.field.settings', {},
            ['div', {}, 'Idle Indicator Threshold'],
            ['div#idleIndicatorThreshold', {}],
            ['div#idleIndicatorDisplay', {}, (ttTools.idleIndicator.threshold() / ttTools.constants.time.minutes) + 'm'],
            ['br'],
            ['div', {}, 'Auto DJ Delay'],
            ['div#autoDJDelay', {}],
            ['div#autoDJDisplay', {}, (ttTools.autoDJ.delay() / ttTools.constants.time.seconds) + 's'],
            ['br'],
            ['div', {}, 'Auto Vote Delay'],
            ['div#autoVoteDelay', {}],
            ['div#autoVoteDisplay', {}, (ttTools.autoVote.delay() / ttTools.constants.time.seconds) + 's']
          ],
        ]
      ];
    }
  },

  info : {
    render : function () {
      turntable.showAlert();
      $('<style/>', {
        type : 'text/css',
        text : "div.modal ul li {\
          font-size:16px;\
          text-align:left;\
        }\
      "}).appendTo($('div.modal'));
      $('div.modal div:first')
        .html('')
        .append(ttTools.constants.whatsNew)
        .append(ttTools.constants.donateButton);
    }
  },

  // UI stuff
  toolbar : {
    render : function () {
      turntable.playlist.setPlaylistHeightFunc = turntable.playlist.setPlaylistHeight;
      turntable.playlist.setPlaylistHeight = function (a) {
        var a = this.setPlaylistHeightFunc(a);
        $(turntable.playlist.nodes.root).find(".queueView .songlist").css({
            height: Math.max(a - 120, 55)
        });
        return a;
      }
      turntable.playlist.setPlaylistHeight($('div.chat-container').css('top').replace('px', ''));

      $('<style/>', {
        type : 'text/css',
        text : "\
        div.resultsLabel {\
          top:65px !important;\
          height:20px !important;\
          padding-top:7px !important;\
          background-color:#CCC !important;\
        }\
        div.songlist {\
          font-size:0.5em;\
          top:95px !important;\
        }\
        #playlistTools {\
          left:0;\
          right:0;\
          top:65px;\
          height:2em;\
          padding:2px 0 2px 50px;\
          position:absolute;\
        }\
        #playlistTools label { font-size:5px; }\
        #playlistTools button { width:auto; height:auto; }\
        #playlistTools button .ui-button-text { padding:.6em; }\
        #playlistTools div, #playlistTools button { float:left; }\
        #switches { margin:0 3px; }\
        #switches ui-button-text { padding:0.6em 1em; }\
      "}).appendTo(document.head);

      $(util.buildTree(this.tree())).insertAfter(
        $('form.playlistSearch')
      );

      $('div#switches').buttonset();

      $('input#autoAwesome').click(function (e) {
        if (ttTools.autoVote.enabled() !== 'up') ttTools.autoVote.setEnabled('up');
        else ttTools.autoVote.setEnabled('false');
        ttTools.views.toolbar.update();
        ttTools.autoVote.execute();
      }).prop('checked', ttTools.autoVote.enabled() === 'up').button('refresh');

      $('input#autoLame').click(function (e) {
        if (ttTools.autoVote.enabled() !== 'down') ttTools.autoVote.setEnabled('down');
        else ttTools.autoVote.setEnabled('false');
        ttTools.views.toolbar.update();
        ttTools.autoVote.execute();
      }).prop('checked', ttTools.autoVote.enabled() === 'down').button('refresh');

      // $('input#autoRoll').click(function (e) {
      //   ttTools.autoRoll.setEnabled(!ttTools.autoRoll.enabled());
      // }).prop('checked', ttTools.autoRoll.enabled()).button('refresh');

      $('input#autoDJ').click(function (e) {
        ttTools.autoDJ.setEnabled(!ttTools.autoDJ.enabled());
        ttTools.autoDJ.execute();
      }).prop('checked', ttTools.autoDJ.enabled()).button('refresh');

      $('input#animations').click(function (e) {
        ttTools.animations.setEnabled(!ttTools.animations.enabled());
      }).prop('checked', ttTools.animations.enabled()).button('refresh');      

      $('button#showTheLove').button({
        text  : false,
        icons : {
          primary: 'ui-icon-heart'
        }
      }).click(function (e) {
        var maxOffset = 200 * Object.keys(ttObjects.room.users).length;
        for (user in ttObjects.room.users) {
          setTimeout(function (user) {
            ttObjects.manager.show_heart(user);
          }, Math.round(Math.random() * maxOffset), user);
        }
      });
    },

    tree : function () {
      return ['div#playlistTools', {},
        ['div#switches', {},
          ['input#autoAwesome', { type : 'checkbox' }],
          ['label', { 'for' : 'autoAwesome' },
            ['span.ui-icon.ui-icon-circle-arrow-n', { title: 'Automatically upvote songs' }],
          ],
          ['input#autoLame', { type : 'checkbox' }],
          ['label', { 'for' : 'autoLame' },
            ['span.ui-icon.ui-icon-circle-arrow-s', { title: 'Automatically downvote songs' }],
          ],
          // ['input#autoRoll', { type : 'checkbox' }],
          // ['label', { 'for' : 'autoRoll' },
          //   ['span.ui-icon.ui-icon-circle-arrow-s', { title: 'Automatically roll (casino mode)' }],
          // ],
          ['input#autoDJ', { type : 'checkbox' }],
          ['label', { 'for' : 'autoDJ' },
            ['span.ui-icon.ui-icon-person', { title: 'Attempt to get the next DJ spot' }],
          ],
          ['input#animations', { type : 'checkbox' }],
          ['label', { 'for' : 'animations' },
            ['span.ui-icon.ui-icon-video', { title: 'Toggle animations on/off' }]
          ],
        ],
        ['button#showTheLove', { title: 'Show The Love' }]
      ];
    },

    update : function () {
      $('#autoDJ').prop('checked', ttTools.autoDJ.enabled()).button('refresh');
      $('#autoAwesome').prop('checked', ttTools.autoVote.enabled() === 'up').button('refresh');
      $('#autoLame').prop('checked', ttTools.autoVote.enabled() === 'down').button('refresh');
    }
  },

  users : {
    render : function () {
      $('<style/>', {
        type : 'text/css',
        text : "\
        div.guest.upvoter { background-color:#aea !important;}\
        div.guest.upvoter:hover { background-color:#cec !important; }\
        div.guest.downvoter { background-color:#eaa !important; }\
        div.guest.downvoter:hover { background-color:#ecc !important; }\
        div.guest.current_dj { background-color:#ccf !important; }\
        div.guest.current_dj:hover { background-color:#ddf !important; }\
        div.guestName .emoji {\
          padding:3px 0;\
          margin-left:3px;\
        }\
        div.guestName .status {\
          padding:0 7px;\
          margin:0 3px 0 -3px;\
          background-image:url('https://s3.amazonaws.com/static.turntable.fm/images/pm/status_indicators_depth.png');\
        }\
        div.guestName .status.green { background-position:0 0; }\
        div.guestName .status.yellow { background-position:0 -13px; }\
        div.guestName .status.grey { background-position:0 -26px; }\
        div.guestName .status.red { background-position:0 -39px; }\
        div#voteCount {\
          position:absolute;\
          top:3px;\
          right:20px;\
          font-size:12px;\
          text-shadow:-1px 0 black,0 1px black,1px 0 black,0 -1px black;\
        }\
        div#voteCount span.up { color:#aea; }\
        div#voteCount span.down { color:#eaa; }\
      "}).appendTo(document.head);
      $('<div/>', { id : 'voteCount' }).appendTo($('div.chatHeader'));
      ttObjects.room.updateGuestList();
      this.update();
    },

    update : function () {
      ttTools.views.users.updateVoteCount();
      $('div.guests .guest').each(function (index, element) {
        ttTools.views.users.updateUser(element.id);
      });
    },

    updateVoteCount : function () {
      $('div#voteCount')
        .html('')
        .append(util.emojify(':thumbsup:'))
        .append($('<span/>', { 'class':'up' }).html(ttObjects.room.upvoters.length))
        .append('&nbsp;&nbsp;&nbsp;')
        .append(util.emojify(':thumbsdown:'))
        .append($('<span/>', { 'class':'down' }).html(ttTools.downVotes.downvotes))
    },

    updateUser : function (uid) {
      var guest = $('div#' + uid);
      var guestName = guest.find('div.guestName');
      var user = ttObjects.room.users[uid];

      guest.find('span').remove();
      guest.attr('class', 'guest');

      if (uid === ttObjects.room.currentDj) guest.addClass('current_dj');
      if ($.inArray(uid, ttObjects.room.upvoters) > -1) guest.addClass('upvoter');
      if ($.inArray(uid, ttTools.downVotes.downvoters) > -1) guest.addClass('downvoter');

      guestName.prepend(
        $('<span/>')
          .addClass('status')
          .addClass(ttTools.views.users.userStatus(uid))
          .hover(function (e) {
            var title = 'Last spoke ' + ttTools.timestamp(ttTools.userActivityLog.message(uid)) + ' ago';
            title += "\n";
            title += 'Last voted ' + ttTools.timestamp(ttTools.userActivityLog.vote(uid)) + ' ago';
            $(this)
              .attr('title', title)
              .attr('class', 'status')
              .addClass(ttTools.views.users.userStatus(uid));
          })
      );

      if (user.verified)
        guestName
          .append(
            $(util.emojify(':tophat:'))
              .attr('title', 'Verified ' + user.verified)
          );

      if ($.inArray(uid, ttTools.constants.hackers) > -1)
        guestName
          .append(
            $(util.emojify(':octocat:'))
              .attr('title', 'turntable.fm hacker')
          );

      if ($.inArray(uid, ttObjects.room.djIds) > -1)
        guestName
          .append(
            $(util.emojify(':notes:'))
              .attr('title', 'Is on the decks')
          );
    },

    userStatus : function (uid) {
      var lastActivity = ttTools.userActivityLog.lastActivity(uid);
      var threshold = ttTools.idleIndicator.threshold();
      if (lastActivity > threshold) return 'red';
      if (lastActivity > (threshold / 2)) return 'yellow';
      return 'green';
    }
  }
}
ttTools.database = {

  dbName        : 'ttTools.database',
  dbDisplayName : 'ttTools Database',
  dbVersion     : '1.0',
  dbMaxSize     : 10000000,
  dbHandle      : false,

  isSupported : function () {
    return window.openDatabase ? true : false;
  },

  getDatabase : function () {
    if (this.dbHandle) { return this.dbHandle; }
    this.dbHandle = openDatabase(this.dbName, this.dbVersion, this.dbDisplayName, this.dbMaxSize);
    return this.dbHandle;
  },

  execute : function (query, success, failure) {
    console.log(query);
    this.getDatabase().transaction(  
      function (transaction) {
        transaction.executeSql(query, [], success, failure);
      }
    );
  }
}
ttTools.tags = {

  dbTable : 'tags',

  // This class needs to be re-thought
  loadRetry : 30,
  load : function (retry) {
    if (!ttTools.database.isSupported()) return;
    if (!turntable.playlist || turntable.playlist.files == 0) {
      if (retry > ttTools.tags.loadRetry) { return alert('Could not load ttTools tagging.'); }
      var callback = function () { ttTools.tags.load(retry++); }
      return setTimeout(callback, 1000);
    }
    ttTools.tags.init();
  },

  init : function () {
    $('<style/>', {
      type : 'text/css',
      text : "\
      div.tagsinput { border:1px solid #CCC; background: #FFF; padding:5px; width:300px; height:100px; overflow-y: auto;}\
      div.tagsinput span.tag { border: 1px solid #a5d24a; -moz-border-radius:2px; -webkit-border-radius:2px; display: block; float: left; padding: 5px; text-decoration:none; background: #cde69c; color: #638421; margin-right: 5px; margin-bottom:5px;font-family: helvetica;  font-size:13px;}\
      div.tagsinput span.tag a { font-weight: bold; color: #82ad2b; text-decoration:none; font-size: 11px;  }\
      div.tagsinput input { width:80px; margin:0px; font-family: helvetica; font-size: 13px; border:1px solid transparent; padding:5px; background: transparent; color: #000; outline:0px;  margin-right:5px; margin-bottom:5px; }\
      div.tagsinput div { display:block; float: left; }\
      .tags_clear { clear: both; width: 100%; height: 0px; }\
      .not_valid {background: #FBD8DB !important; color: #90111A !important;}\
      div.song div.ui-icon-tag {\
        top: 24px;\
        right: 5px;\
        width: 16px;\
        height: 16px;\
        cursor: pointer;\
        position: absolute;\
      }\
    "}).appendTo(document.head);
    ttTools.tags.createTable();
    ttTools.tags.updateQueue();
    ttTools.tags.addSongOverride();
    ttTools.tags.filterQueueOverride();
  },

  updateQueue : function () {
    var elements = $('div.song').unbind(
      'click'
    ).click(function(e) {
      ttTools.tags.views.add.file = $(this).closest('.song').data('songData');
      ttTools.tags.views.add.render();
    });
    $('div.song div.ui-icon-tag').remove();
    this.getFids(function (tx, result) {
      var fids = [];
      for (var i=0; i<result.rows.length; i++) {
        fids.push(result.rows.item(i).fid);
      }
      elements.each(function (index, element) {
        element = $(element);
        var fid = element.closest('.song').data('songData').fileId;
        if ($.inArray(fid, fids) > -1) {
          $('<div/>', {
            'class' : 'ui-icon ui-icon-tag',
            title   : 'This song is ttTagged'
          }).appendTo(element);
        }
      });
    });
  },

  addSongOverride : function () {
    turntable.playlist.addSong_ttTools = turntable.playlist.addSong;
    turntable.playlist.addSong = function (b, a) {
      turntable.playlist.addSong_ttTools(b, a);
      ttTools.tags.updateQueue();
    }
  },

  filterQueueOverride : function () {
    turntable.playlist.filterQueue_ttTools = turntable.playlist.filterQueue;
    turntable.playlist.filterQueue = function (filter) {
      turntable.playlist.filterQueue_ttTools(filter);
      if (filter.length > 0) {
        ttTools.tags.getFidsForTagLike(
          filter,
          function (tx, result) {
            var fids = [];
            for (var i=0; i<result.rows.length; i++) {
              fids.push(result.rows.item(i).fid);
            }
            $('div.queue div.song:hidden').each(function(index, value) {
              var element = $(value);
              var fid = element.data('songData').fileId;
              if ($.inArray(fid, fids) > -1) {
                element.closest('.song').show().addClass('filtered');
              }
            });
          }
        );
      }
    }
  },

  createTable : function () {
    ttTools.database.execute(
      'CREATE TABLE IF NOT EXISTS ' +
      this.dbTable + '(' +
      'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' +
      'fid TEXT NOT NULL,' +
      'tag TEXT NOT NULL' +
      ');'
    );
  },

  resetData : function () {
    ttTools.database.execute('DROP TABLE IF EXISTS ' + this.dbTable + ';');
    this.createTable();
    this.addTag('4dd6c222e8a6c404330002c5', 'trololo');
    ttTools.tags.updateQueue();
  },

  getAll : function (success, failure) {
    return ttTools.database.execute(
      'SELECT DISTINCT fid, tag FROM ' + this.dbTable + ';',
      success,
      failure
    );
  },

  getFids : function (success, failure) {
    return ttTools.database.execute(
      'SELECT DISTINCT fid FROM ' + this.dbTable + ';',
      success,
      failure
    );
  },

  getFidsForTag : function (tag, success, failure) {
    return ttTools.database.execute(
      'SELECT DISTINCT fid FROM ' + this.dbTable + ' WHERE tag="' + tag + '";',
      success,
      failure
    );
  },

  getFidsForTagLike : function (tag, success, failure) {
    return ttTools.database.execute(
      'SELECT DISTINCT fid FROM ' + this.dbTable + ' WHERE tag LIKE "%' + tag + '%";',
      success,
      failure
    );
  },

  getTagsForFid : function (fid, success, failure) {
    return ttTools.database.execute(
      'SELECT DISTINCT tag FROM ' + this.dbTable + ' WHERE fid="' + fid + '";',
      success,
      failure
    );
  },

  addTag : function (fid, tag, success, failure) {
    return ttTools.database.execute(
      'INSERT INTO ' + this.dbTable + ' (fid,tag) VALUES("' + fid + '", "' + tag + '");',
      success,
      failure
    );
  },

  removeTag : function (fid, tag, success, failure) {
    return ttTools.database.execute(
      'DELETE FROM ' + this.dbTable + ' WHERE fid="' + fid + '" AND tag="' + tag + '";',
      success,
      failure
    );
  }
}
ttTools.tags.views = {

  add : {
    file : null,

    render : function () {
      util.showOverlay(util.buildTree(this.tree()));
      var file = this.file;

      ttTools.tags.getAll(function (tx, result) {
        var tags = {};
        for (var i=0; i<result.rows.length; i++) { tags[result.rows.item(i).tag] = 1; }
        var tags = Object.keys(tags);
        $('#tags').tagsInput({
          width            : '100%',
          onAddTag         : function (tag) {
            ttTools.tags.addTag(file.fileId, tag);
          },
          onRemoveTag      : function (tag) {
            ttTools.tags.removeTag(file.fileId, tag);
          },
          autocomplete_url : false,
          autocomplete     : {
            source : tags
          }
        });
      });

      ttTools.tags.getTagsForFid(
        this.file.fileId,
        function (tx, result) {
          for (var i=0; i<result.rows.length; i++) {
            $('#tags').addTag(result.rows.item(i).tag, {
              callback : false
            });
          }
        }
      );
    },

    tree : function () {
      return ['div.settingsOverlay.modal', {},
        ['div.close-x', {
          event : {
            click : function () {
              util.hideOverlay();
              ttTools.tags.updateQueue();
            }
          }
        }],
        ['br'],
        ['h1', this.file.metadata.song],
        ['div', {}, this.file.metadata.artist],
        ['br'],
        ['input#tags', { type : 'text' }]
      ];
    }
  }
}
ttTools.release = 1332007348;
ttTools.load(0);
