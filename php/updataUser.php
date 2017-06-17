<?php
	$myfile=fopen("../json/usersdata.json","r")or die("Unable to open file!");
	$str=fread($myfile,filesize("../json/usersdata.json"));
	fclose($myfile);
	$user=$_GET['u'];
	$score=intval($_GET['s']);
	$data=json_decode($str,true);

    for($i=0;$i<count($data['users']);$i++){
        if($data['users'][$i]['name']==$user){
            $data['users'][$i]['score']=$score;
            break;
        }
    }
    if($i>=count($data['users'])){
        $data['users'][]=['name'=>$user,'score'=>$score];
    }
    $json_string=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
    $myfile = fopen("../json/usersdata.json", "w+") or die("Unable to open file!");
    fwrite($myfile,$json_string);
	fclose($myfile);
    echo $json_string;
?>