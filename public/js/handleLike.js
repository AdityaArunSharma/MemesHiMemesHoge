
function handleLike(t,x,id){    
      
      
      console.log(t.className.split(/\s+/));
      x = t.className.split(/\s+/).includes("fas") ? "dislike" : "like";        
      t.classList.toggle("fas");
      var fas=false,far=false;
      var classList = t.className.split(/\s+/);
      console.log("classList "+classList);
      if(!classList.includes("fas") &&  !classList.includes("far"))
      {
            console.log("both not present");
            t.classList.add("far");
      }

      console.log(t.className.split(/\s+/));
      console.log(x);
      var data = {
            x: x,
            id: id
      }
      var xhr = new window.XMLHttpRequest()
      xhr.open('POST', '/handleLike', true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.send(JSON.stringify(data)) 
      
      xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
               // Typical action to be performed when the document is ready:
               console.log( xhr.responseText);
               if(xhr.responseText=="error"){
                  t.classList.toggle("fas");
                  alert("Login to like");
               }
            }
        };

}