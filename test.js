
list = []

for(var x=0;x<10;x++){
        list.push(x)
}

var index = 0;

while(index<list.length) {

        for(var x=0;x<3 && index<list.length; x++,index++) {
                console.log(list[index])                
        }
        console.log("\n");
}
