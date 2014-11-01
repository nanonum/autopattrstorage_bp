outlets = 4;
// outlet 0 > pattrstorage
// outlet 1 = preset
// outlet 2 = umenu
// outlet 3 = dict
var filetype = 'json';

/*function filename(str){
	patcher.storagename = str;
	post(patcher.storagename); post();
}*/
function update_path(){
	var root = (function(){
		return _repeat(patcher);
		function _repeat(p){
			if(p.parentpatcher !== null){
				return _repeat(p.parentpatcher);
			}else{
				return p;
			}
		}
	}());
	patcher.rootpath = root.filepath.match("^.*/")[0];
	var p = patcher;
//	patcher.rootname = root.name;	
//	var filename = root.name;
//	outlet(0, path+ str);
}
update_path.local = 1;

function store(){
	importjson();
	exportnames();
}


// ONLOAD!!!!
function setname(storagename){
	patcher.storagename = storagename;
	
	update_path();
	
	importjson();
	exportnames();

	outlet(0, 'name', storagename);
	outlet(1, 'pattrstorage', storagename);
}

function clear(){
	outlet(0, 'clear', 1);
}
function overwrite(){
	update_path();
	outlet(0, 'write', patcher.rootpath + patcher.storagename + '.' + filetype);
}
function reload(){
	update_path();
	outlet(0, 'read', patcher.rootpath + patcher.storagename + '.' + filetype);
}
function read(){
	outlet(0, 'read');
}

function renumber(){
	outlet(0, 'renumber');
}
var d, o;
function importjson(){	
	// DO NOT OVERWRITE JSON!!!
	d = new Dict(patcher.storagename+'_presetname');
	d.import_json(patcher.rootpath+patcher.storagename+'.json');
	
	outlet(3, 'dictionary', patcher.storagename+'_presetname')
}
importjson.local = 1;

function exportnames(){
	if(d.get('pattrstorage') === null){
		initarray();
		return false;
	}
	var slots = d.get('pattrstorage').get('slots');
	var keys = slots.getkeys();

	outlet(2, 'clear');
	var arr = new Array(30);
	for(var key in keys){
		arr[~~(keys[key])] = slots.get(keys[key]).get('data::autopattrstorage_presetname');
	}
	post('array'); post(arr); post();
	for(var i = 1, length = arr.length; i <= length; i++){
		if(arr[i] === undefined){
			outlet(2, 'append', i + ' - ');
		}else{
			outlet(2, 'append', i + ' - ' + arr[i]);
		}
	}
}
function initarray(){
	
	outlet(2, 'clear');
	var arr = new Array(30);
	for(var i = 1, length = arr.length; i <= length; i++){
		outlet(2, 'append', i + ' - ');
	}
}

function load(str){
	var hoge = splitumenu(str);
	outlet(0, ~~(hoge[0]));
}
function store(str){
	var splited = splitumenu(str);
	var index =  ~~(splited[0]);
	outlet(0, 'store', index);
	overwrite();
	
//	update_path();
	
	importjson();
	exportnames();
	
	outlet(2, 'set', index-1);
}
function splitumenu(str){
	var arg = str.match(/^(\d+) - (.*)/);
	return [RegExp.$1, RegExp.$2];
}

function notifydeleted(){
	// overwrite();
}


// outlet 0 > pattrstorage
// outlet 1 = preset
// outlet 2 = umenu
// outlet 3 = dict
setoutletassist(-1, annotation);
function annotation(num){
	switch(num){
		case 0:
		assist("connect to the pattrstorage object in parent");
		break;
		case 1:
		assist("connect to the preset object in parent");
		break;
		case 2:
		assist("connect to the umenu in parent");
		break;
		case 3:
		assist("connect to a dict in same patcher");
		break;
	}
}

function dict_to_jsobj(dict) {
	var o = new Object();
	var keys = dict.getkeys();

	if (keys instanceof Array) {
		for (var i = 0; i < keys.length; i++)
		{
			var value = dict.get(keys[i]);

			if (value && value["push_to_coll"]) {
				value = dict_to_jsobj(value);
			}
			o[keys[i]] = value;
		}
	} else {
		var value = dict.get(keys);
		o[keys] = value;
	}

	return o;
}
