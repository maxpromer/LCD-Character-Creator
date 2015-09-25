var ArduinoTemplate = "";
ArduinoTemplate += "#include &lt;LiquidCrystal.h&gt;\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "LiquidCrystal lcd(12, 11, 5, 4, 3, 2); // RS, E, D4, D5, D6, D7\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "byte customChar[] = {\n";
ArduinoTemplate += "  {DataX0},\n";
ArduinoTemplate += "  {DataX1},\n";
ArduinoTemplate += "  {DataX2},\n";
ArduinoTemplate += "  {DataX3},\n";
ArduinoTemplate += "  {DataX4},\n";
ArduinoTemplate += "  {DataX5},\n";
ArduinoTemplate += "  {DataX6},\n";
ArduinoTemplate += "  {DataX7}\n";
ArduinoTemplate += "};\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "void setup() {\n";
ArduinoTemplate += "  lcd.begin(16, 2);\n";
ArduinoTemplate += "  lcd.createChar(0, customChar);\n";
ArduinoTemplate += "  lcd.home();\n";
ArduinoTemplate += "  lcd.write(0);\n";
ArduinoTemplate += "}\n";
ArduinoTemplate += "\n";
ArduinoTemplate += "void loop() { }";

var ArduinoI2CTemplate = "";
ArduinoI2CTemplate += "#include &lt;Wire.h&gt;\n";
ArduinoI2CTemplate += "#include &lt;LiquidCrystal_I2C.h&gt;\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "// Set the LCD address to 0x27 in PCF8574 by NXP and Set to 0x3F in PCF8574A by Ti\n";
ArduinoI2CTemplate += "LiquidCrystal_I2C lcd(0x3F, 16, 2);\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "byte customChar[] = {\n";
ArduinoI2CTemplate += "  {DataX0},\n";
ArduinoI2CTemplate += "  {DataX1},\n";
ArduinoI2CTemplate += "  {DataX2},\n";
ArduinoI2CTemplate += "  {DataX3},\n";
ArduinoI2CTemplate += "  {DataX4},\n";
ArduinoI2CTemplate += "  {DataX5},\n";
ArduinoI2CTemplate += "  {DataX6},\n";
ArduinoI2CTemplate += "  {DataX7}\n";
ArduinoI2CTemplate += "};\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "void setup() {\n";
ArduinoI2CTemplate += "  lcd.begin();\n";
ArduinoI2CTemplate += "  lcd.createChar(0, customChar);\n";
ArduinoI2CTemplate += "  lcd.home();\n";
ArduinoI2CTemplate += "  lcd.write(0);\n";
ArduinoI2CTemplate += "}\n";
ArduinoI2CTemplate += "\n";
ArduinoI2CTemplate += "void loop() { }";

function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}

reloadData = function() {
	$("[name='datatype']").each(function(index, element) {
        if ($(this).is(":checked")) type = $(this).val();
    });
	var Data = [];
	for (var x=0;x<=7;x++) {
		var BinStr="";
		for (var y=0;y<=4;y++) {
			if ($(".dot-px[data-x='" + x + "'][data-y='" + y + "']").attr("class").indexOf("high")>=0) {
				BinStr += "1";
			} else {
				BinStr += "0";
			}
		}
		Data[x] = type == "hex" ? "0x" + binaryToHex(BinStr)['result'] : "B" + BinStr;
	}
	var interfacing;
	$("[name='interfacing']").each(function(index, element) {
        if ($(this).is(":checked")) interfacing = $(this).val();
    });
	var html= interfacing == "parallel" ? ArduinoTemplate : ArduinoI2CTemplate;
	for (var i=0;i<=7;i++) {
		html = html.replace("{DataX" + i + "}", Data[i]);
	}
	$("#code-box").html(html);
	Prism.highlightAll();
}

$(document).ready(function(e) {
    $(".dot-px").click(function(e) {
        if ($(this).attr("class").indexOf("high")>=0) {
          $(this).removeClass("high");
		} else {
          $(this).addClass("high");
        }
		reloadData();
    });
	
	$("[name='color']").change(function(e) {
        $(".box-char").removeClass("green").removeClass("blue").addClass($(this).val());
    });
	
	$("[name='datatype'], [name='interfacing']").change(function(e) {
        reloadData();
    });
	
	$("#clear").click(function(e) {
		for (var x=0;x<=7;x++) {
			for (var y=0;y<=4;y++) {
				$(".dot-px[data-x='" + x + "'][data-y='" + y + "']").removeClass("high");
			}
		}
        reloadData();;
    });
	
	$("#invert").click(function(e) {
		for (var x=0;x<=7;x++) {
			for (var y=0;y<=4;y++) {
				if ($(".dot-px[data-x='" + x + "'][data-y='" + y + "']").attr("class").indexOf("high")>=0)
					$(".dot-px[data-x='" + x + "'][data-y='" + y + "']").removeClass("high");
				else
					$(".dot-px[data-x='" + x + "'][data-y='" + y + "']").addClass("high");
			}
		}
        reloadData();;
    });
	
	reloadData();
});