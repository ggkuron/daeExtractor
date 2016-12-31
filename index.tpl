<html>
  <head>
    <style>
      ul {
        list-style: none;
      }
      td {
        padding: 0;
        margin: 0;
      }
      .table__row {
        margin: 0;
        padding: 0;
        width: 100%;
        background: rgb(127, 255, 212);
      }
      .row__item, .row__header {
        border: 1px solid rgb(240, 240, 240);
        width: 100%;
      }
      .row__header {
        background: rgb(240, 240, 240);
      }
      .row__item:first-child {
        padding-left: 10px;
      }
      .row__id {
        width: 5em;
      }
      .btn {
        background: rgb(240, 240, 240);
        text-align: center;
        cursor: pointer;
      }
      .btn:hover {
        background: rgb(103, 103, 103);
        color: rgb(242, 243, 252); 
      }
      #btn_add {
        padding: 0;
        margin: 0;
        width: 100%;
      }
      #btn_add:hover {
        font-weight: bold;
      }
      tr.object__edit {
        display: none;
      }
      tr.object__edit.edit--active {
        display: table-row;
      }
    </style>
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
                Name: document.getElementById('txt_name').value
            }
            xhr.send(JSON.stringify(data));
            // http://stackoverflow.com/questions/36408373/posting-form-data-with-nickel-rs-works-the-first-time-returns-404-subsequent-ti
            // xhr.onloaded = function() {
            // }
            setTimeout(location.reload(true), 200);
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
