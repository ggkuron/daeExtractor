<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/css/main.css">
    <script src="/js/table.js"></script>
    <script>
        function editToggle() {
            Array.from(document.getElementsByClassName('object__edit'))
                 .forEach(e => e.classList.toggle('edit--active'))
        }
        function actionDelete(id) {
            postJSON('/object/delete/' + id,
                     { token: "" });
        }
        function actionNew() {
            postJSON('/object/new', 
                     {
                         ObjectId: document.getElementById('txt_id').value,
                         Name: document.getElementById('txt_name').value,
                         FileName: document.getElementById('upd_file').files[0].name
                     });
        }
    </script>
  </head>
  <body>
    <div class="table">
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
