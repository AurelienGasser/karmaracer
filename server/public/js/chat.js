function sendMsg() {
  if ($('#chat_input').val().trim() != '') {
    var msg = $('#player_name').val() + ': ' + $('#chat_input').val();
    game.SocketManager.getConnection().emit('chat', msg);
  }
  $('#chat_input').val('');
}