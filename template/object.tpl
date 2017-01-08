<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/css/main.css">
    <script>
        function editToggle() {
            Array.from(document.getElementsByClassName('object__edit'))
                 .forEach(e => e.classList.toggle('edit--active'))
        }
        function actionDelete(id) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/object/delete/' + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            var data = { token: "" };
            xhr.send(JSON.stringify(data));

            xhr.onload = () => { 
                if(xhr.readyState === 4) this.location.reload(true);
            };
        }
        function actionNew() {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/object/new', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            var data = {
                ObjectId: document.getElementById('txt_id').value,
                Name: document.getElementById('txt_name').value,
                FileName: document.getElementById('upd_file').files[0].name
            }
            xhr.send(JSON.stringify(data));

            // http://stackoverflow.com/questions/36408373/posting-form-data-with-nickel-rs-works-the-first-time-returns-404-subsequent-ti
            xhr.onload = () => { 
                if(xhr.readyState === 4) this.location.reload(true);
            };

        }
    </script>
  </head>
  <body>
    <div class="table">
      <h2 class="table__title">Object Table</h2>
      <table>
        <thead>
            <tr class="table__row">
                <td class="table__row__header table__row__header--id">ObjectId</td>
                <td class="table__row__header">Name</td>
                <td class="table__row__header" >DELETE</td>
            </tr>
        </thead>
        <tfoot>
            <tr class="table__row object__edit edit--active">
              <td colspan="3" class="btn flatadd" onclick="editToggle()">
                  &plus;
              </td>
            </tr>
            <tr class="table__row object__edit">
              <td colspan="3" class="btn flatadd" onclick="editToggle()">
                  hide
              </td>
            </tr>
            <tr class="table__row object__edit">
              <td class="table__row__item table__row__item--id">
                <input id="txt_id" type="number"></input>
              </td>
              <td class="table__row__item" colspan="2">
                <input id="txt_name" type="text"></input>
              </td>
            </tr>
            <tr class="table__row object__edit">
              <td class="table__row__item">
                <input id="upd_file" type="file"></input>
              </td>
              <td class="table__row__item btn" colspan="2" onclick="actionNew();editToggle()">
                Save
              </td>
            </tr>
        </tfoot>
        <tbody>
            {{#objects}}
            <tr class="table__row" onclick="document.getElementById('detailFrame').src = '/object/{{ObjectId}}'">
                <td class="table__row__item table__row__item--id">{{ObjectId}}</td>
                <td class="table__row__item">{{Name}}</td>
                <td class="table__row__item btn"
                    onclick="event.stopPropagation(); if(confirm('are you sure?')) actionDelete({{ObjectId}})">
                    &#215;
                </td>
            </tr>
            {{/objects}}
        </tbody>
      </table>
    </div>

    <iframe id="detailFrame" class="detailFrame"></iframe>
  </body>
</html>
