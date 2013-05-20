(function() {
  "use strict";

  var ChatController = function() {
    this.j = {
      input: $('#chat_input'),
      messages: $('#chat_msgs'),
      label: $('#chat_input_label'),
      input_wrapper: $('#chat_input_wrapper')
    };
    this.isOpen = false;
    this.msg_id = 0;
  };

  ChatController.prototype.sendMsg = function() {
    if (this.j.input.val().trim() !== '') {
      var msg = (Karma.LocalStorage.get('playerName')) + ': ' + $('#chat_input').val();
      Karma.gameInstance.socketManager.emit('chat', msg);
    }
    this.j.input.val('');
    this.hideChat();
  };

  ChatController.prototype.onChatMsgReceived = function(msg, cssClass) {
    if (KLib.isUndefined(cssClass)){
      cssClass = '';
    }
    var key = 'chat_msg_' + this.msg_id;
    var $li = $('<li class="' + cssClass + '" id="' + key + '">' + msg + '</li>');
    this.j.messages.append($li);
    setTimeout(function() {
      $li.fadeOut(500, function() {
        $li.remove();
      });
    }, 20000);
    this.msg_id += 1;
  };

  ChatController.prototype.showChat = function() {
    this.j.label.html((Karma.LocalStorage.get('playerName')) + ' :');
    this.j.input_wrapper.show();
    this.j.input.focus();
    this.j.input_wrapper.addClass('enable');
    this.isOpen = true;
  };

  ChatController.prototype.hideChat = function() {
    this.j.input.blur();
    this.j.input_wrapper.hide();
    this.j.input_wrapper.removeClass('enable');
    this.isOpen = false;
  };

  ChatController.prototype.clearChatInputField = function() {
    this.j.input.val('');
  };

  Karma.ChatController = ChatController;

}());