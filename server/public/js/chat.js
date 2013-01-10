function sendMsg() {
  if ($('#chat_input').val().trim() != '') {
    var msg = $('#player_name').val() + ': ' + $('#chat_input').val();
    gameInstance.socketManager.getConnection().emit('chat', msg);
  }
  $('#chat_input').val('');
}