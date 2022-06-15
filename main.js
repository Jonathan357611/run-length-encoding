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
})

$("#image_btn").click(function(){
    var image = window.image
    if (image == "example") {
        $.ajax({ type: "GET",   
                url: "/sprites/01",   
                async: false,
                success : function(text)
                {
                    image = text;
                }
        });
    }
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
        var curr_div_name = $("#" + "img_div" + curr_div)
        for (var char of line) {
            if (char == "1") {
                curr_div_name.append("<div class=\"img_main_cell_ON\"></div>")
            } else {
                curr_div_name.append("<div class=\"img_main_cell_OFF\"></div>")
            }
        }
    };
    console.log("Image displayed!")
    window.currcell = 0;
    window.image = image;
    window.item_count = {}
    window.curr_binary = 0
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
    var final_string = ""

    if ( Array.from(code)[0] == "B" ) {
        final_string = "1"
    } else {
        final_string = "0"
    };
    final_string += codetable[Array.from(code)[1]];
    return final_string
}


$("#encoding_nextstep").click(function(){
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

    // Show every cell iterated over:
    var current_row = Math.ceil(window.currcell / 8);
    var current_cell = 8+(window.currcell - (current_row*8))

    var all_cells = []

    for (let i = 0; i < 11; i++) {
        var row_div = $("#img_main").children("div").eq(i);
        for (let j = 0; j < 8; j++) {
            var cell_div = row_div.children("div").eq(j);
            all_cells.push(cell_div);
        }
    }

    console.log(all_cells)
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
        $("#show_size").append("<p>Original Image: 96 Bits</p><p>New Size: " + window.curr_binary*4 +" Bits</p>");
        
    }
});