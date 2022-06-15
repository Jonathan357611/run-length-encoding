String.prototype.replaceAt = function(index, replacement) {  // https://stackoverflow.com/a/1431113/14626562
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

$.ajax({ type: "GET",   
        url: "sprites/01",   
        async: false,
        success : function(text)
        {
            window.drawedImage = text;
        }
});

$( document ).ready(function() {
    $("#step1").hide();
    $("#live_encode").hide();
    console.log("Site loaded!")
    console.log("Written by Jonathan F.")
});


$("#goto_step1").click(function(){
    $("#home").hide();
    $("#live_encode").hide();
    $("#step1").show();

    var image_div = $("#draw_image");
    var curr_div = 0
    var count = 0;
    for (let i = 0; i < 11; i++){
        curr_div++;
        image_div.append("<div class=\"img_main_row\" id=\"draw_div" + curr_div + "\"></div>");
        var curr_div_name = $("#" + "draw_div" + curr_div);
        for (let j = 0; j < 8; j++) {
            if (Array.from(window.drawedImage)[count] == "0") {
                curr_div_name.append("<div id=\"draw_btn_" + count + "\" onclick=\"drawing(" + count + ");\" class=\"img_main_cell_OFF_HL\"></div>");
            } else {
                curr_div_name.append("<div id=\"draw_btn_" + count + "\" onclick=\"drawing(" + count + ");\" class=\"img_main_cell_ON_HL\"></div>");
            }
            count++;
        };
    };
});

function drawing (number) {
    var button = $("#draw_btn_" + number);
    if (button.attr('class') == "img_main_cell_OFF_HL") {
        button.attr('class', 'img_main_cell_ON_HL');
        window.drawedImage = window.drawedImage.replaceAt(number, "1");
    } else {
        button.attr('class', 'img_main_cell_OFF_HL');
        window.drawedImage = window.drawedImage.replaceAt(number, "0");
    }
    console.log(window.drawedImage)
}

$('.image_btn').click(function(){
    var count = 0;
    var final = ""
    for (letter of window.drawedImage) {
        if (count == 8) {
            count = 0;
            final += "\n";
        };
        count++;
        final += letter;
    }
    image = final

    console.log("Loaded image:")
    console.log(image)
    $("#home").hide();
    $("#step1").hide();
    $("#live_encode").show();

    // Display encoding process
    // Display image
    var image_div = $("#img_main");
    var curr_div = 0
    for(var line of image.split(/\r?\n/)){
        curr_div++;
        image_div.append("<div class=\"img_main_row\" id=\"img_div" + curr_div + "\"></div>");
        var curr_div_name = $("#" + "img_div" + curr_div);
        for (var char of line) {
            if (char == "1") {
                curr_div_name.append("<div class=\"img_main_cell_ON\"></div>");
            } else {
                curr_div_name.append("<div class=\"img_main_cell_OFF\"></div>");
            };
        };
    };
    console.log("Image displayed!");
    window.currcell = 0;
    window.image = image;
    window.item_count = {};
    window.curr_binary = 0;
    window.done = false;
});

function binaryToColor(number) {
    if (number == "1") {
        return "W";
    }
    return "B";
}

function codeToBinary(code) {
    var codetable = {
        "1": "000",
        "2": "001",
        "3": "010",
        "4": "011",
        "5": "100",
        "6": "101",
        "7": "110",
        "8": "111"
    };
    var final_string = "";

    if ( Array.from(code)[0] == "B" ) {
        final_string = "1"
    } else {
        final_string = "0"
    };
    final_string += codetable[Array.from(code)[1]];
    return final_string
}


$("#encoding_nextstep").click(function(){
    if (window.done) {
        window.location.reload(true);
        $("#home").hide();
        $("#live_encode").hide();
        $("#step1").show();
        return;
    };

    var image = window.image.replace(/[\n\r]/g, '');
    
    var letter_before = null;
    var code_to_append = "";
    var count = null;
    var color = null
    var i = 0;
    var first_iter = true;
    
    for (var letter of image) {
        if ( i >= window.currcell) {
            
            if (first_iter == true) {
                var first_iter = false;
                color = binaryToColor(letter);
                count = 1
                letter_before = letter
                code_to_append = color + count;
            } else {
                if (letter == letter_before && count < 8) {
                    color = binaryToColor(letter);
                    
                    count++;
                    code_to_append = color + count;
                    letter_before = letter
                    
                } else {
                    window.currcell = i;
                    break;
                }
            };
            window.currcell++;
        };
        i++;
    };

    if (window.currcell >= 88) {
        window.done = true;
    }

    // Show every cell iterated over:
    var all_cells = [];

    for (let i = 0; i < 11; i++) {
        var row_div = $("#img_main").children("div").eq(i);
        for (let j = 0; j < 8; j++) {
            var cell_div = row_div.children("div").eq(j);
            all_cells.push(cell_div);
        }
    }

    for (let cell = 0; cell < window.currcell; cell++) {
        var thecell = all_cells[cell];
        if (image[cell] == "0") {
            thecell.attr('class', 'img_main_cell_OFF_HL');
        } else {
            thecell.attr('class', 'img_main_cell_ON_HL');
        }
    }

    if (code_to_append) {
        if (window.item_count.hasOwnProperty(code_to_append) == false) {
            window.item_count[code_to_append] = 1
        } else {
            window.item_count[code_to_append] += 1
        }

        var text_div = $("#encode_entity_count");
        text_div.empty();
        

        Object.keys(window.item_count).forEach(function(key) {
            text_div.append("<p>" + window.item_count[key] + "x " + key + "</p>")
        });

        var binary_code = $("#binary_code");
        if (window.curr_binary == 0) {
            binary_code.append("<p>");
        }
        window.curr_binary += 1
        binary_code.append(codeToBinary(code_to_append) + " ");
        if (window.curr_binary % 8 == 0){
            binary_code.append("</p>");
            binary_code.append("<p>");
        };
        $("#show_size").empty();
        
        var compression_rate = Math.round((window.curr_binary*4)/88*100*100)/100
        if (compression_rate > 100 ) {
            color = "red";
        } else {
            color = "yellowgreen";
        };

        $("#show_size").append("<p>Original Image: 88 Bits</p><p style=\"color: " + color + "\">New Size: " + window.curr_binary*4 +" Bits ("+ compression_rate +"%)</p>");
        
        if (window.done) {
            $("#encoding_nextstep").text("( Again )")
        }
    }
});