function start() {
  var chatInfo = getChatInfo();
  var socket = io.connect(chatInfo.host);
  console.log(chatInfo.host);
  var codes = {
    addUser: '1',
    removeUser: '2',
    message: '3',
    censored: '4'
  };
  $(function() {
    $('#data').focus();
    $('#datasend').click(function() {
      var message = $('#data').val();
      $('#data').val('');
      $('#data').focus();
      var sent = {
        message: message,
        id: chatInfo.id
      };
      socket.emit('sendchat', sent);
    });

    $('#data').keypress(function(e) {
      if(e.which == 13) {//enter key
        $(this).blur();
        $('#datasend').focus().click();
      }
    });
  });
  socket.on('connect', function() {
    socket.user = chatInfo.user;
    socket.emit('adduser', {
      user: socket.user,
      id: chatInfo.id
    });
    
    function updateUsers(users) {
      $('#users').empty();
      $.each(users, function(key, value) {
        var userRep = value.name;
        if(socket.user === value.name) {
          userRep = '<b>' + userRep + '</b>';
        }
        $('#users').append('<div>' + userRep + '</div>');
      });
    }

    function addConversation(message) {
     $('#conversation').prepend(message); 
    }

    function renderExplanation(user, tokens, weights) {
      $('#explanation').empty(); 
      $('#explanation').append(user + ' was censored based on the following words:<br>');
      $('#explanation').append('<ul>');
      for(var i = 0; i < tokens.length; i++) {
        if(weights[i] > 0) {
          $('#explanation').append('<li class="censored">' + tokens[i] + '</li>');
        }
      }
      $('#explanation').append('</ul>');

      addConversation('<div><b>' + data.from.name +'</b>: ' + data.message + '</div>');
      
       var jsonCircles = [{ "x_axis": 30, "y_axis": 30, "radius": 20, "color" : "green" },
                          { "x_axis": 70, "y_axis": 70, "radius": 20, "color" : "purple"},
                          { "x_axis": 110, "y_axis": 100, "radius": 20, "color" : "red"}];
 
       var svgContainer = d3.select("#explanation").append("svg")
                                     .attr("width", 200)
                                     .attr("height", 200);
 
       var circles = svgContainer.selectAll("circle").data(jsonCircles)
                            .enter()
                            .append("circle");

      var circleAttributes = circles
                         .attr("cx", function (d) { return d.x_axis; })
                         .attr("cy", function (d) { return d.y_axis; })
                         .attr("r", function (d) { return d.radius; })
                         .style("fill", function(d) { return d.color; });

    }

    socket.on(codes.addUser, function(data) {
      addConversation('<div>' + data.changed.name + ' was added.</div>');
      updateUsers(data.all);
    });

    socket.on(codes.removeUser, function(data) {
      addConversation('<div>' + data.changed.name + ' has left.</div>'); 
      updateUsers(data.all);
    });
    var curId = 0;
    socket.on(codes.censored, function(data){
      if(data.from && data.reason) {
        renderExplanation(data.from.name, data.reason.tokens, data.reason.tokenScores);
      }
        addConversation('<div class="text-error" name="' + curId + '"><b>' + data.from.name +
                                   '</b> was censored. See explanation. </div>');
        var elementSelector = "[name='" + curId + "']";
        $(elementSelector).hover(function() {
          renderExplanation(data.from.name, data.reason.tokens, data.reason.tokenScores);
          $(this).toggleClass('text-warning');
          $(this).toggleClass('text-error');
        });
        curId++;
    });
  });
}
start();
