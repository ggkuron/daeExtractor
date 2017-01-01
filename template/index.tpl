<html>
  <head>
    <link rel="stylesheet" type="text/css" href="css/main.css">
    <script>
        function editToggle() {
            Array.from(document.getElementsByClassName('object__edit'))
                 .forEach(e => e.classList.toggle('edit--active'))
        }
        function actionDelete(id) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/' + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        }
        function actionNew() {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/new', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            var data = {
                ObjectId: document.getElementById('txt_id').value,
                Name: document.getElementById('txt_name').value,
                FileName: document.getElementById('upd_file').files[0].name
            }
            xhr.send(JSON.stringify(data));
            // http://stackoverflow.com/questions/36408373/posting-form-data-with-nickel-rs-works-the-first-time-returns-404-subsequent-ti
            xhr.onloaded = () => location.reload(true)
            xhr.onerror = () => location.reload(true)
            // setTimeout(location.reload(true), 100);
        }
    </script>
  </head>
  <body>
    <div class="table">
      <h2 class="table__title">Object Table</h2>
      <table>
        <thead>
            <tr class="table__row">
                <td class="row__header row__id">ObjectId</td>
                <td class="row__header">Name</td>
                <td class="row__header" >DELETE</td>
            </tr>
        </thead>
        <tfoot>
            <tr class="table__row object__edit edit--active">
              <td colspan="3" id="btn_add" class="btn" onclick="editToggle()">
                  &plus;
              </td>
            </tr>
            <tr class="table__row object__edit">
              <td class="row__item row__id">
                <input id="txt_id" type="number"></input>
              </td>
              <td class="row__item" colspan="2">
                <input id="txt_name" type="text"></input>
              </td>
            </tr>
            <tr class="table__row object__edit">
              <td class="row__item">
                <input id="upd_file" type="file"></input>
              </td>
              <td class="row__item btn" colspan="2" onclick="actionNew()">
                Save
              </td>
            </tr>
        </tfoot>
        <tbody>
            {{#objects}}
            <tr class="table__row">
                <td class="row__item row__id">{{ObjectId}}</td>
                <td class="row__item">{{Name}}</td>
                <td class="row__item btn"
                    onclick="return confirm('are you sure?')">
                    &#215;
                </td>
            </tr>
            {{/objects}}
        </tbody>
      </table>
    </div>
  </body>
</html>
