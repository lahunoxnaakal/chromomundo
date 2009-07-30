/* Chrome Saving Lib by Wa
 * A simple library for saving data in a Chrome extension! Use in a toolstrip, background page, or arbitrary html page in your extension.
 * NOT your content script!
 * Use saveData(Variable Name,Data to Save); to save your data.
 * Use loadData(Variable Name,Default Value if entry is non-existant); to load your data if any exists.
 */

function trim(stringa){
    while (stringa.substr(0,1) == ' '){
        stringa = stringa.substr(1, stringa.length);
    }
    while (stringa.substr(stringa.length-1, stringa.length) == ' '){
        stringa = stringa.substr(0,stringa.length-1);
    }
    return stringa;
}
 
function saveData(name,data)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+366);
    exdate = exdate.toGMTString();
    document.cookie = name+"="+escape(data)+";expires="+exdate;        
}

function loadData(name,def)
{
    var parse = document.cookie;               
    var loc = parse.indexOf("; "+name+"=")+name.length+3;
    
    if(loc == name.length+2)
    {
        if(parse.substr(0,name.length+1) == name+"=")
        {
            loc = name.length+1;
        }
        else 
        {
            return def;
        }
    }
    var lo2 = parse.indexOf(";",loc);
    lo2 = (lo2==-1)?parse.length:lo2;
    if ( loc == lo2 )
        loc -= 1;
    
    return trim(unescape(parse.substring(loc,lo2)));
}

function removeData(name)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate()-2);
    exdate = exdate.toGMTString();
    document.cookie = name+"= ;expires="+exdate;
}

function exists(name)
{
    var parse = document.cookie;               
    var loc = parse.indexOf("; "+name+"=")+name.length+3;
    
    if(loc == name.length+2)
    {
        if(parse.substr(0,name.length+1) == name+"=")
        {
            return true;
        }
        else 
        {
            return false;
        }
    }       
}

function clearData()
{
    var parse = document.cookie;
    var end = false;
    while ( parse.length > 2 && (end == false) )
    {
        var l_value = parse.indexOf(';');
        var l_key = parse.indexOf('=');
        var key = trim(parse.substr(0, l_key));
        removeData(key);
        if ( l_value > 0 )
            parse = parse.substr(l_value+1);
        else
            end = true;            
    }              
}

function getNameValueCollection()
{
    var parse = document.cookie;
    var dict = {};
    var end = false;
    while ( parse.length > 2 && (end == false) )
    {
        var l_value = parse.indexOf(';');
        var l_key = parse.indexOf('=');
        var key = trim(parse.substr(0, l_key));
        var value = loadData(key, "");
        if ( l_value > 0 )
            parse = parse.substr(l_value+1);
        else
            end = true;
            
        dict[key] = value;
        console.log("Key-Value pair: " + key + " = " + value);
    }        
    
    return dict;
}
