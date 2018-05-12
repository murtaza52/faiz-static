var params = null;
var sid;
var index = 0;
var defaultUrl = rootUrls["real"];
var extra = "";
var selected = null;

$('#send_operator').change(function(){
  switch($(this).val())
  {
    case 'sms':
      $('#send_param2').parent().addClass("hidden");
      $('#send_param').parent().removeClass("hidden");
      $("#balance").parent().removeClass("hidden");
    break;
    case 'mock':
      $('#send_param2').parent().removeClass("hidden");
      $('#send_param').parent().removeClass("hidden");
      $("#balance").parent().addClass("hidden");
    break;
    // default:
    //   $("#send_param").parent().addClass("hidden");
    //   $("#send_param2").parent().addClass("hidden");
  }

});
$("#send").on('click', function(){
  selected = getSelected();
  selectedRecords = JSON.stringify(getSelected());
  timeInterval = $("#send_param").val();
  message = $('#message').val();
  requestObj = $.post("send.php", { 
    records: selectedRecords,
    message: message
  });
  requestObj.done(function(data){
    var json = null;
    try{
      json = JSON.parse(data);
      debugger;
    }catch(err){
      document.write(data);
      return;
    }
    if(json['result'] == "success"){
      params = json['params'];
      //now our usual logic will go here!
      timeInterval = parseInt($("#send_param").val());
      //check what we are sending here?
      if($("#send_operator").val()=='sms'){
        $("#sure_modal").modal();
      }
      else{
        // this is a mock message, validate the input first
        var mock_param = $("#send_param2").val();
        if(mock_param.match("^[+-]?\\d+$") != null)
        {
            console.log("number");
            extra = "&chatid="+mock_param;
            url = rootUrls['telegram'];
        }
        else if(mock_param.match("^[\\w.]+@[\\w.]+$"))
        {
            console.log("email");
            extra = "&email="+mock_param;
            url = rootUrls['email'];
        }
        else{
            alert("Invalid input! either enter a telegram chat id or an email address");
            return;
        }
        $("#status").html("");
        updateStatus("started timer! total records: "+params.length+" and approx time: "+(timeInterval*params.length/1000)+"s", -1);
        sid = setInterval(sendSms.bind(null, url, extra), timeInterval); 

      }
    }
    else {
      alert("there was some error in retrieving the urls");
    }
  });
});

$("#send_sure").on('click', function(){
  extra = "&chatid=163349099";
  timeInterval = parseInt($("#send_param").val());
  $("#status").html("");
  updateStatus("started timer! total records: "+params.length+" and approx time: "+(timeInterval*params.length/1000)+"s", -1);
  sid = setInterval(sendSms.bind(null, defaultUrl, extra), timeInterval);  
});

var sendSms = function(gateway, extra){
    url = gateway+params[index]+extra;
    // console.log("url");
    //console.log(url);
    //console.log(extra);
    debugger;
    name_field = selected[index]['name'];
    number_field = selected[index]['contact'];
    updateStatus("("+(index+1)+") sending message to "+name_field+" on "+number_field, index);
    $.ajax({
        url: url,
        beforeSend: function(jqxhr, settings) {
            jqxhr.name_field = name_field;
            jqxhr.number_field = number_field;
            jqxhr.index_field = index;
        },
        type: "GET",
        complete: function(e) {
            // updateStatus("<b>sent to "+e.name_field+" on "+e.number_field +"</b>", e.index_field);
            updateStatus(' <span class="label label-success label-as-badge"><i class="fa fa-check fa-lg"></i></span>', e.index_field);
        },
        crossDomain:true,
        error: function(xhrobj, status, text){
          console.log(xhrobj);
          //console.log(xhrobj.responseText);
          console.log(status);
          //console.log(text);
        }
        });
    index=index + 1;
    if(index>=params.length)
    {
        clearInterval(sid);
        updateStatus("stopped timer", -1);
        index = 0;
        updateBalance();
    }
}

var updateStatus = function(status, index){
  //console.log("updateStatus was called with "+status+" "+index);
  className='list-group-item';
  if(index < 0)
  {
      $("#status").append("<li class='"+className+"''>"+status+"</li>");
      return;
  }
  var li = $("#status li.classSent"+index);
  // console.log("li length");
  // console.log(li.length);
  if(li.length) 
      li.append(status);
  else {
      $("#status").append("<li class = 'classSent"+index+" "+className+"' >"+status+"</li>");
  }          
}
var updateBalance = function() {
  $.get("_getBalance.php", function(data) {
      $("#balance").html("<strong>Bal: </strong>"+data);
    });
}
updateBalance();