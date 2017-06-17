var xmlhttp;
var url="php/updataUser.php";

function $(id){
    return document.getElementById(id);
}
function loadXMLDoc(url){
    xmlhttp=null;
    if (window.XMLHttpRequest)
    {// code for Firefox, Opera, IE7, etc.
        xmlhttp=new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp!=null)
    {
        url=url+"?u="+sessionStorage.user;
        url=url+"&s="+sessionStorage.score;
        xmlhttp.onreadystatechange=state_Change;
        xmlhttp.open("GET",url,true);
        xmlhttp.send(null);
    }
    else
    {
        alert("Your browser does not support XMLHTTP.");
    }
}

function state_Change()
{
    if(xmlhttp.readyState==4)
    {// 4 = "loaded"
        if(xmlhttp.status==200)
        {// 200 = "OK"
            var date=eval("("+xmlhttp.responseText+")"); 
            date.users.sort(sortNumber);
            var order=document.getElementById("userrank");
            for(var i=0;i<5;i++){
                var li=document.createElement("li");
                order.appendChild(li);
                order.lastChild.innerHTML=date.users[i].name+":"+date.users[i].score;
            }
        }
        else
        {
            alert("Problem retrieving XML data:" + xmlhttp.statusText);
        }
    }
}
function sortNumber(a,b){
    return  b.score-a.score;
}

function onSubmit(){
    var str=$("username").value;
    if(str.length==0){
        $("user").innerHTML="Guest";
    }else{
        $("user").innerHTML=str;
    }
    sessionStorage.user=$("user").innerHTML;
}
