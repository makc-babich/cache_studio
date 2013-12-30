$("document").ready(function(){
    $.ajax({
        method:"GET",
        url:"http://localhost:57773/csp/FAMILYDOCTOR/getListPeople",
        dataType: "json",
        cache: false,
        success: function(data){

         $.each(data.children, function(index, value) {
           $('.table > tbody:last').append('<tr><td>'+(index+1)+'</td><td>'+data.children[index].surname
                                           +'</td><td>'+data.children[index].name
                                           +'</td><td>'+data.children[index].patronymic
                                           +'</td><td>'+data.children[index].birthDate+'</td></tr>');
            });
        },
        error: function(){
            alert("ERROR");
        }
    })

})

















