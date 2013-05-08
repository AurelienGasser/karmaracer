(function() {
  "use strict";

  var Chat = {};


  var j = {
    input: $('#chat_input'),
    messages: $('#chat_msgs'),
    label: $('#chat_input_label'),
    input_wrapper: $('#chat_input_wrapper')
  };


  Chat.sendMsg = function() {
    if (j.input.val().trim() !== '') {
      var msg = (Karma.LocalStorage.get('playerName')) + ': ' + $('#chat_input').val();
      Karma.gameInstance.socketManager.emit('chat', msg);
    }
    j.input.val('');
    Chat.hideChat();
  };

  Chat.onChatMsgReceived = function(msg, key) {
    j.messages.append('<li id="' + key + '">' + msg + '</li>');
    setTimeout(function() {
      $('li#' + key).fadeOut(500, function() {
        $('li#' + key).remove();
      });
    }, 20000);
  };

  Chat.showChat = function() {
    j.label.html((Karma.LocalStorage.get('playerName')) + ' :');
    j.input_wrapper.show();
    j.input.focus();
    j.input_wrapper.addClass('enable');
  };

  Chat.hideChat = function() {
    j.input.blur();
    j.input_wrapper.hide();
    j.input_wrapper.removeClass('enable');
  };

  Chat.clearChatInputField = function() {
    j.input.val('');
  };

  Karma.Chat = Chat;

}());