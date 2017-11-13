$(document).ready( function() {

    $('#saveNewLinkTitleButton').click( function(){
        var newTitle = $('#newLinkTitleInputField').val();

        if (newTitle == "") {

            event.preventDefault();
        }else {

            var parameters = {"title": newTitle};

            console.log("parameter is : " + parameters);

            $.post('/pages/newlink', parameters, function(data) {


                console.log("Received data is : " + JSON.stringify(data.link));
                var link = data.link._id;
                console.log("link id is : " + link);
                localStorage.setItem('link', data.link.title);
                 window.location.href = "/pages/newlink" + '#' + data.link._id;


                
            });
        }
    });
});