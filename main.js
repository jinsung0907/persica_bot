var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var port = 3000;

app.listen(port, () => console.log('Persica bot running in ' + port + 'port'));

var dolls = JSON.parse(fs.readFileSync('json/doll.json', 'utf8'));
var equips = JSON.parse(fs.readFileSync('json/equip.json', 'utf8'));
var fairys = JSON.parse(fs.readFileSync('json/fairy.json', 'utf8'));

var mainmenu = ["인형", "장비", "시간표", "스토리모음", "제대편성&DPS시뮬"];

app.get('/keyboard', (req, res) => {
	res.json({"type": "buttons", "buttons": mainmenu});
});

app.post('/message', (req, res) => {
	var content = req.body.content;
	var user = req.body.user_key;
	var level = loaduser(user);
	
	console.log(user + " -> " + content);
	
	if(typeof content === 'undefined' || content == '') {
		res.json({"message": { "text": "정확하지 않은 값입니다."}, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
	if(content === "인형") {
		res.json({"message": { "text": "제조시간(8:10->810) 또는 인형이름 입력\n\n인형리스트 : http://gfl.zzzzz.kr/dolls.php" }, "keyboard": { "type": "text" } });
		saveuser(user, 1);
		return;
	}
	else if(content === "장비") {
		res.json({"message": { "text": "제조시간(3:05-> 305) 또는 요정이름 입력\n\n요정리스트 : http://gfl.zzzzz.kr/fairys.php" }, "keyboard": { "type": "text" } });
		saveuser(user, 2);
		return;
	}
	else if(content === "시간표") {
		res.json({"message": { "text": "제조시간표 : http://gfl.zzzzz.kr/timetable.php" }, "message_button": { "label": "소전DB 제조시간표", "url": "http://gfl.zzzzz.kr/timetable.php" }, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
	else if(content === "스토리모음") {
		res.json({"message": { "text": "소녀전선 메인 스토리 : http://gfl.zzzzz.kr/story_list.php\n소녀전선 서브 스토리 : http://gfl.zzzzz.kr/substory_list.php" }, "message_button": { "label": "소전DB 스토리목록", "url": "http://gfl.zzzzz.kr/story_list.php" }, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
	else if(content === "제대편성&DPS시뮬") {
		res.json({"message": { "text": "소전DB 제대편성&DPS시뮬레이터 : http://gfl.zzzzz.kr/simulator.php" }, "message_button": { "label": "소전DB 제대편성&DPS시뮬레이터", "url": "http://gfl.zzzzz.kr/simulator.php" }, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
	else if(level == 0) {
		res.json({"message": { "text": "정확하지 않은 값입니다." }, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
	else if(level == 3) {
		var doll = getDollFromName(content);
		if(doll) {
			var message = "레어도 : " + doll.rank + "성\n";
			
			if(typeof doll.krName !== 'undefined')
				message += "이름 : " + doll.krName + "\n";
			else 
				message += "이름 : " + doll.name + "\n";
			
			message += "종류 : " + doll.type.toUpperCase();
			message += "\n\n상세정보 : http://gfl.zzzzz.kr/doll.php?id=" + doll.id;
			
			res.json({
				"message": {
					"text": message,
					"photo": {
						"url": "http://gfl.zzzzz.kr/img/dolls/" + doll.id + ".png",
						"width": 512,
						"height": 512
					},
					"message_button": {
						"label": "소전DB 상세정보 페이지",
						"url": "http://gfl.zzzzz.kr/doll.php?id=" + doll.id
					}
				},
				"keyboard": {
					"type": "buttons",
					"buttons": mainmenu
				}
			});
			saveuser(user, 0);
			return;
		}
	}
	
	var num = parseInt(content);
	//숫자가 아닐경우
	if(num == 0 || isNaN(num)) {
		//인형 level일 경우
		if(level == 1) {
			var doll = getDollFromName(content);
			if(doll) {
				var message = "레어도 : " + doll.rank + "성\n";
				
				if(typeof doll.krName !== 'undefined')
					message += "이름 : " + doll.krName + "\n";
				else 
					message += "이름 : " + doll.name + "\n";
				
				message += "종류 : " + doll.type.toUpperCase();
				message += "\n\n상세정보 : http://gfl.zzzzz.kr/doll.php?id=" + doll.id;
				
				res.json({
					"message": {
						"text": message,
						"photo": {
							"url": "http://gfl.zzzzz.kr/img/dolls/" + doll.id + ".png",
							"width": 512,
							"height": 512
						},
						"message_button": {
							"label": "소전DB 상세정보 페이지",
							"url": "http://gfl.zzzzz.kr/doll.php?id=" + doll.id
						}
					},
					"keyboard": {
						"type": "buttons",
						"buttons": mainmenu
					}
				});
				saveuser(user, 0);
				return;
			}
		}
		//장비 level일경우
		else if(level == 2) {
			var fairy = getFairyFromName(content);
			if(fairy){
				var message = fairy.krName;
				message += "\n\n상세정보 : http://gfl.zzzzz.kr/fairy.php?id=" + fairy.id;
				
				res.json({
					"message": {
						"text": message,
						"photo": {
							"url": "http://gfl.zzzzz.kr/img/fairy/" + fairy.name + "_3.png",
							"width": 512,
							"height": 512
						},
						"message_button": {
							"label": "소전DB 상세정보 페이지",
							"url": "http://gfl.zzzzz.kr/fairy.php?id=" + fairy.id
						}
					},
					"keyboard": {
						"type": "buttons",
						"buttons": mainmenu
					}
				});
				saveuser(user, 0);
				return;
			}
		}
		else {
			res.json({"message": { "text": "정확하지 않은 값입니다." } , "keyboard": {"type": "buttons", "buttons": mainmenu}});
			return;
		}
	}
	
	if(!isNaN(num)) {
		//인형 level일경우
		if(level == 1) {
			var doll = getDollFromTime(num);
			if(doll) {
				if(!Array.isArray(doll)) {
					var message = "레어도 : " + doll.rank + "성\n";
					
					if(typeof doll.krName !== 'undefined')
						message += "이름 : " + doll.krName + "\n";
					else 
						message += "이름 : " + doll.name + "\n";
					
					message += "종류 : " + doll.type.toUpperCase();
					message += "\n\n상세정보 : http://gfl.zzzzz.kr/doll.php?id=" + doll.id;
					
					res.json({
						"message": {
							"text": message,
							"photo": {
								"url": "http://gfl.zzzzz.kr/img/dolls/" + doll.id + ".png",
								"width": 512,
								"height": 512
							},
							"message_button": {
								"label": "소전DB 상세정보 페이지",
								"url": "http://gfl.zzzzz.kr/doll.php?id=" + doll.id
							}
						},
						"keyboard": {
							"type": "buttons",
							"buttons": mainmenu
						}
					});
					saveuser(user, 0);
					return;
				}
				else {
					var message = "나올 수 있는 인형\n";
					var btns = [];
					for(var i in doll) {
						if(typeof doll[i].krName !== 'undefined') var name = doll[i].krName;
						else var name = doll[i].name;
						
						message += name + " -> " + doll[i].rank + "성 " + doll[i].type.toUpperCase() + "\n";
						btns.push(name);
					}
					message = message.replace(/\n$/, "");
					res.json({
						"message": {
							"text": message
						},
						"keyboard": {
							"type": "buttons",
							"buttons": btns
						}
					});
					
					saveuser(user, 3);
					return;
				}
			}
			else {
				res.json({"message": { "text": "일치하는 인형이 없습니다" }, "keyboard": {"type": "buttons", "buttons": mainmenu} });
				return;
			}
		}
		
		//장비 level일경우
		else if(level == 2) {
			//요정일경우 
			if(num >= 300) {
				var fairy = getFairyFromTime(num);
				if(fairy){
					var message = fairy.krName;
					message += "\n\n상세정보 : http://gfl.zzzzz.kr/fairy.php?id=" + fairy.id;
					
					res.json({
						"message": {
							"text": message,
							"photo": {
								"url": "http://gfl.zzzzz.kr/img/fairy/" + fairy.name + "_3.png",
								"width": 512,
								"height": 512
							},
							"message_button": {
								"label": "소전DB 상세정보 페이지",
								"url": "http://gfl.zzzzz.kr/fairy.php?id=" + fairy.id
							}
						},
						"keyboard": {
							"type": "buttons",
							"buttons": mainmenu
						}
					});
					saveuser(user, 0);
					return;
				}
				else {
					res.json({"message": { "text": "일치하는 요정이 없습니다" }, "keyboard": {"type": "buttons", "buttons": mainmenu} });
					return;
				}
			}
			//장비일경우
			else {
				var equip = getEquipFromTime(num);
				if(equip) {
					if(Array.isArray(equip)) {
						var message = '';
						for(var i in equip) {
							message += "랭크 : " + equip[i].rank + "성\n이름 : " + equip[i].name + "\n종류 : " + getEquipType(equip[i].category, equip[i].type) + "\n스탯 : \n" + getEquipAttr(equip[i].stats, equip[i].name, equip[i].type);
							message += "\n======\n";
						}
					}
					else {
						var message = "랭크 : " + equip.rank + "성\n이름 : " + equip.name + "\n종류 : " + getEquipType(equip.category, equip.type) + "\n스탯 : \n" + getEquipAttr(equip.stats, equip.name, equip.type);
					}
					
					res.json({
						"message": {
							"text": message,
							"photo": {
								"url": "http://gfl.zzzzz.kr/img/equip/" + getEquipImg(equip[0]) + ".png",
								"width": 256,
								"height": 256
							},
							"message_button": {
								"label": "소전DB 장비 기능 준비중입니다.",
								"url": "about:blank"
							}
						},
						"keyboard": {
							"type": "buttons",
							"buttons": mainmenu
						}
					});
					saveuser(user, 0);
					return;
				}
				else {
					res.json({"message": { "text": "일치하는 장비가 없습니다" }, "keyboard": {"type": "buttons", "buttons": mainmenu} });
					return;
				}
			}
		}
	}
	else {
		res.json({"message": { "text": "정확하지 않은 값입니다."}, "keyboard": {"type": "buttons", "buttons": mainmenu}});
		return;
	}
});

function getFairyFromTime(time) {
	time = (Math.floor(time/100)*60 + time%100)*60;

	for(var i in fairys) {
		if(time == fairys[i].buildTime) {
			return fairys[i];
			break;
		}
	}
	
	return false;
}

function getFairyFromName(name) {
	for(var i in fairys) {
		if(convSearch(name) == fairys[i].name || convSearch(name) == fairys[i].krName) {
			return fairys[i];
			break;
		}
	}
	
	return false;
}

function getDollFromName(name) {
	for(var i in dolls) {
		if(convSearch(dolls[i].name) == convSearch(name) || convSearch(dolls[i].krName) == convSearch(name)) {
			return dolls[i];
			break;
		}
	}
	return false;
}

function convSearch(str) {
	return str.replace(/ /g,'');
}

function getDollFromTime(time) {
	time = (Math.floor(time/100)*60 + time%100)*60;
	
	var arr = [];
	var count = 0;
	for(var i in dolls) {
		if(time == dolls[i].buildTime) {
			arr.push(dolls[i]);
			count++;
		}
	}
	
	if(count == 1) {
		return arr[0];
	}
	
	else if(count != 0) {
		return arr;
	}
	
	return false;
}

function getEquipFromTime(time) {
	time = (Math.floor(time/100)*60 + time%100)*60;
	
	var arr = [];
	var count = 0;
	
	for(var i in equips) {
		if(time == equips[i].buildTime) {
			arr.push(equips[i]);
			count++
		}
	}
	
	if(count != 0) {
		return arr;
	}
	
	return false;
}

function getEquipAttr(stats, name, type) {
	var result = '';
	if (typeof stats.armor !== 'undefined') {
		result += "장갑+" + stats.armor.min + " ";
	}
	
	if (typeof stats.dodge !== 'undefined') {
		if(type == 'ammoBox')
			result += "회피" + stats.dodge.min + " ";
		else
			result += "회피+" + stats.dodge.min + " ";
	}
	
	if (typeof stats.hit !== 'undefined') {
		result += "명중+" + stats.hit.min + " ";
	}
	
	if (typeof stats.pow !== 'undefined') {
		if(type == 'sgBullet' && name == '슬러그')
			result += "화력%" + stats.pow.min + " ";
		else if(type == 'skeleton' && (name == "IOP T4 외골격" || name == "IOP T3 외골격" || name == "IOP T2 외골격" || name == "IOP T1 외골격"))
			result += "화력" + stats.pow.min + " ";
		else
			result += "화력+" + stats.pow.min + " ";
	}
	
	if (typeof stats.range !== 'undefined') {
		result += "사거리+" + stats.range.min + " ";
	}
	
	if (typeof stats.rate !== 'undefined') {
		result += "사속+" + stats.rate.min + " ";
	}
	
	if (typeof stats.crit !== 'undefined') {
		result += "치명타율+" + stats.crit.min + "% ";
	}
	
	if (typeof stats.critDmg !== 'undefined') {
		result += "치명피해+" + stats.critDmg.min + "% ";
	}
	
	if (typeof stats.armorPiercing !== 'undefined') {
		if(type == 'hpBullet')
			result += "관통" + stats.armorPiercing.min + " ";
		else 
			result += "관통+" + stats.armorPiercing.min + " ";
	}
	
	if (typeof stats.nightView !== 'undefined') {
		result += "야시능력+" + stats.nightView.min + "% ";
	}
	
	if (typeof stats.coolDown !== 'undefined') {
		result += "쿨타임 감소+" + stats.coolDown.min + "% ";
	}
	
	if (typeof stats.bullet !== 'undefined') {
		result += "장탄수+" + stats.bullet.min + " ";
	}
	
	if (typeof stats.speed !== 'undefined') {
		result += "이동속도+" + stats.speed.min + " ";
	}
	return result;
}

function getEquipType(category, type) {
	var result = '';
	switch(category) {
		case "accessory": result += '부속'; break;
		case "doll": result += '인형장비'; break;
		case "ammo": result += '탄약'; break;
	}
	result += '/';
	
	switch(type) {
		case "nightvision": result += '야시장비'; break;
		case "apBullet": result += '철갑탄'; break;
		case "hpBullet": result += '특수탄'; break;
		case "sgBullet": result += '산탄'; break;
		case "hvBullet": result += '고속탄'; break;
		case "skeleton": result += '외골격'; break;
		case "armor": result += '방탄판'; break;
		case "silencer": result += '소음기'; break;
		case "ammoBox": result += '탄약통'; break;
		case "suit": result += '슈트'; break;
		case "scope": result += '옵티컬'; break;
		case "chip": result += '칩셋'; break;
		case "special": result += '특수'; break;
		case "holo": result += '이오텍'; break;
		case "reddot": result += '레드 닷'; break;
	}
	
	return result;
}	

function getEquipImg(data) {
    let spriteName;
    if (data.fitGuns) {
      dollList.forEach((doll) => {
        if (data.fitGuns[0] === doll.id) {
          let dollName = doll.name.toLowerCase();

          if (dollName.search('ump') !== -1) { dollName = 'ump'; }
          if (dollName.search('ak') !== -1) { dollName = 'ak'; }

          spriteName = `${data.type}_${dollName}`;
        }
      });
    } else {
      switch (data.type) {
        case 'suit': {
          let spriteNum;

          switch (data.rank) {
            case 5: spriteNum = 3; break;
            case 4: spriteNum = 2; break;
            default: spriteNum = 1; break;
          }
          spriteName = `${data.type}_${spriteNum.toString()}`;
        } break;
        case 'sgBullet': {
          let detail = 'b';
          if (data.name.search('슬러그') !== -1) { detail = 's'; }

          spriteName = `${data.type}_${detail}`;
        } break;
        case 'skeleton':
          spriteName = `${data.type}${(data.name.search('X') !== -1) ? '_x' : ''}`; break;

        default: spriteName = data.type; break;
      }

      if (data.name.search('16Lab') !== -1) {
        spriteName = `${spriteName}_lab`;
      }
    }
    return `${spriteName}`;
}

function saveuser(userkey, lev) {
	fs.writeFileSync('session/' + userkey, lev);
}

function loaduser(userkey) {
	try {
		var data = fs.readFileSync('session/' + userkey);
	}
	catch (err) {
		var data = 0;
	}
	
	return data;
}