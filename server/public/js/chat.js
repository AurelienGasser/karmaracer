var default_player_name = 'unknown player';

$(function() {
  $('#player_name').on('keyup', function() {
    Karma.playerName = $('#player_name').val();
  });
})

function sendMsg() {
  if ($('#chat_input').val().trim() != '') {
    var msg = ($('#player_name').val() || default_player_name) + ': ' + $('#chat_input').val();
    gameInstance.socketManager.emit('chat', msg);
  }
  $('#chat_input').val('');
  hideChat();
}

function onChatMsgReceived(msg, key) {
  $('#chat_msgs ul').append('<li id="'+key+'">' + msg + '</li>');
  setTimeout(function() {
    $('li#' + key).fadeOut(500, function() {
      $('li#' + key).remove();
    });
  }, 20000)
}

function showChat() {
  $('#chat_input_label').html((Karma.playerName || default_player_name) + ' :');
  $('#chat_input').show();
  $('#chat_input').focus();
  $('#chat_input_label_wrapper').css('display', 'inline-block');
}

function hideChat() {
  $('#chat_input').blur();
  $('#chat_input_label_wrapper').css('display', 'none');
}

function clearChatInputField() {
  $('#chat_input').val('');
}