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
            xhr.open('POST', '/texture/delete/' + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            var data = { token: "" };
            xhr.send(JSON.stringify(data));

            xhr.onload = () => { 
                if(xhr.readyState === 4) this.location.reload(true);
            };
        }
        function actionSave() {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/texture/new', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            var data = {
                id: document.getElementById('txt_id').value,
                filename: document.getElementById('upd_file').files[0].name
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
                <td class="table__row__header table__row__header--id">TextureId</td>
                <td class="table__row__header">FileName</td>
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
              <td class="table__row__item table__row__item--id">
                <input id="txt_id" type="number"></input>
              </td>
              <td class="table__row__item">
                <input id="upd_file" type="file"></input>
              </td>
              <td class="table__row__item btn" colspan="3" onclick="actionSave();editToggle()">
                Save
              </td>
            </tr>
        </tfoot>
        <tbody>
            {{#objects}}
            <tr class="table__row">
                <td class="table__row__item table__row__item--id">{{TextureId}}</td>
                <td class="table__row__item">{{FileName}}</td>
                <td class="table__row__item btn"
                    onclick="if(confirm('are you sure?')) actionDelete({{TextureId}})">
                    &#215;
                </td>
            </tr>
            {{/objects}}
        </tbody>
      </table>
    </div>
  </body>
</html>
