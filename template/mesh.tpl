<html>
  <head>
    <link rel="stylesheet" type="text/css" href="/css/main.css">
    <script>
        function editToggle(id) {
            Array.from(document.querySelectorAll('.table__row--' + id + ' .object__edit'))
                 .forEach(e => e.classList.toggle('edit--active'))
        }
        function actionDelete(id) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/mesh/delete/' + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            var data = { token: "" };
            xhr.send(JSON.stringify(data));

            xhr.onload = () => { 
                if(xhr.readyState === 4) this.location = "/";
            };
        }
        function actionUpdate(objectId, meshId, textureId) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/mesh/update', true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

            var data = {
                ObjectId: objectId,
                MeshId: meshId,
                TextureId: textureId
            }
            xhr.send(JSON.stringify(data));

            // http://stackoverflow.com/questions/36408373/posting-form-data-with-nickel-rs-works-the-first-time-returns-404-subsequent-ti
            xhr.onload = () => { 
                if(xhr.readyState === 4) this.location = "/object/" + objectId;
            };
        }
    </script>
  </head>
  <body>
    <div class="table">
      <table>
        <thead>
            <tr class="table__row">
                <td class="table__row__header table__row__header--id">ObjectId</td>
                <td class="table__row__header table__row__header--id">MeshId</td>
                <td class="table__row__header">Name</td>
                <td class="table__row__header table__row__header--number">VertexCount</td>
                <td class="table__row__header table__row__item--id">TextureId</td>
                <td class="table__row__header" >EDIT</td>
                <td class="table__row__header" >DELETE</td>
            </tr>
        </thead>
        <tbody>
            {{#objects}}
            <tr class="table__row table__row--{{MeshId}}">
                <td class="table__row__item table__row__item--id">{{ObjectId}}</td>
                <td class="table__row__item table__row__item--id">{{MeshId}}</td>
                <td class="table__row__item">{{Name}}</td>
                <td class="table__row__item table__row__item--number">{{VertexCount}}</td>
                <td class="table__row__item table__row__item--id object__edit edit--active">{{TextureId}}</td>
                <td class="table__row__item table__row__item--id object__edit"><input id="edit_texture__{{MeshId}}" type="number" value="{{TextureId}}"></input></td>
                <td class="table__row__item btn object__edit edit--active"
                    onclick="editToggle({{MeshId}})">
                    EDIT
                </td>
                <td class="table__row__item btn object__edit"
                    onclick="actionUpdate({{ObjectId}}, {{MeshId}}, document.getElementById('edit_texture__{{MeshId}}').value); editToggle({{MeshId}})">
                    Save
                </td>
                <td class="table__row__item btn object__edit edit--active"
                    onclick="if(confirm('are you sure?')) actionDelete({{MeshId}})">
                    &#215;
                </td>
                <td class="table__row__item btn object__edit"
                    onclick="editToggle({{MeshId}})">
                    Cancel
                </td>
            </tr>
            {{/objects}}
        </tbody>
      </table>
    </div>
  </body>
</html>
