
function postJSON(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(data));

    // http://stackoverflow.com/questions/36408373/posting-form-data-with-nickel-rs-works-the-first-time-returns-404-subsequent-ti
    xhr.onload = () => { 
        if(xhr.readyState === 4) this.location.reload(true);
    };
}

