
function sendMsg()
{
  if ($('#chat_input').val().trim() != '') {
    var msg = $('#player_name').val() + ': ' + $('#chat_input').val();
    nodeserver.emit('chat_msg', msg);  
  }
  $('#chat_input').val('');    
}