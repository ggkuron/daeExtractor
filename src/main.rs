#![feature(proc_macro)]

// #[macro_use] extern crate serde_derive;
extern crate rustc_serialize;
#[macro_use] extern crate nickel;
extern crate nickel_sqlite;
// extern crate nickel_mustache;

use nickel::{Nickel, HttpRouter, JsonBody, MediaType};
use nickel_sqlite::{SqliteMiddleware, SqliteRequestExtensions};
use nickel::status::StatusCode;

use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct Object {
    ObjectId:  i32,
    Name:      String
}
#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct Mesh {
    ObjectId: i32,
    MeshId:   i32,
    TextureId: i32,
    Name:     String,
}
#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct Texture {
    TextureId: i32,
    Name:      String,
    Width:     i32,
    Height:    i32,
    Data:      Vec<u8>,
}
#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct MeshVertex {
    ObjectId      :i32,
    MeshId        :i32,
    IndexNo       :i32,
    PositionX     :f32,
    PositionY     :f32,
    PositionZ     :f32,
    NormalX       :f32,
    NormalY       :f32,
    NormalZ       :f32,
    U             :f32,
    V             :f32,
    Joint1        :i32,
    Joint2        :i32,
    Joint3        :i32,
    Joint4        :i32,
    JointWeight1  :f32,
    JointWeight2  :f32,
    JointWeight3  :f32,
    JointWeight4  :f32,
}

const CREATE_TABLE: &'static str = "
CREATE TABLE Object 
  ( ObjectId    INTEGER PRIMARY KEY,
    Name        TEXT NOT NULL
  );
CREATE TABLE Mesh 
  ( ObjectId  INTEGER NOT NULL,
    MeshId    INTEGER NOT NULL,
    TextureId   INTEGER NOT NULL,
    Name      TEXT NOT NULL,
    PRIMARY KEY (ObjectId, MeshId)
  );
CREATE TABLE Texture
  ( TextureId  INTEGER NOT NULL,
    Name      TEXT NOT NULL,
    Width     INTEGER NOT NULL,
    Height    INTEGER NOT NULL,
    Data   Blob NOT NULL,
    PRIMARY KEY (TextureId)
  );
CREATE TABLE MeshVertex 
  ( ObjectId      INTEGER NOT NULL,
    MeshId        INTEGER NOT NULL, 
    IndexNo         INTEGER NOT NULL,
    PositionX     REAL NOT NULL,
    PositionY     REAL NOT NULL,
    PositionZ     REAL NOT NULL,
    NormalX       REAL NOT NULL,
    NormalY       REAL NOT NULL,
    NormalZ       REAL NOT NULL,
    U             REAL NOT NULL,
    V             REAL NOT NULL,
    Joint1        INTEGER NOT NULL,
    Joint2        INTEGER NOT NULL,
    Joint3        INTEGER NOT NULL,
    Joint4        INTEGER NOT NULL,
    JointWeight1  REAL NOT NULL,
    JointWeight2  REAL NOT NULL,
    JointWeight3  REAL NOT NULL,
    JointWeight4  REAL NOT NULL,
    PRIMARY KEY (ObjectId, MeshId, IndexNo)
  );
";

fn main() {
    let mut server = Nickel::new();
    let db_file = "file.db";
    let mw = SqliteMiddleware::new(&db_file).expect("Unable to open sqlite file");
    let db = mw.pool.clone().get().unwrap();

    match db.execute(CREATE_TABLE, &[]) {
        Ok(_) => println!("created tables!"),
        Err(_) => {}
    }

    server.utilize(mw);
    server.get("/", middleware! { |req, mut rep|
        let db = req.db_conn().unwrap();
        let mut stmt = db.prepare("SELECT * FROM Object").unwrap();
        let object_iter = stmt.query_map(&[], |row| {
            Object {
                ObjectId  : row.get(0),   
                Name      : row.get(1),    
            }
        }).unwrap();
        let mut data = HashMap::new();
        let list = object_iter
            .map(|x| x.unwrap())
            .collect::<Vec<Object>>();
        data.insert("objects", list);
        rep.set(StatusCode::Ok);
        rep.set(MediaType::Html);
        return rep.render("index.tpl", &data);
    });
    server.post("/new", middleware! { |req, mut rep|
        let json = req.json_as::<Object>().unwrap();
        let conn = req.db_conn().unwrap();
        match conn.execute("
            INSERT INTO Object 
              (ObjectId, Name) 
            VALUES 
              ($1, $2);",
            &[&json.ObjectId, &json.Name]) {
            Ok(_) => format!("Success"),
            Err(err) => format!("Could not insert a new entry: {}", err)
        };
    });
    server.listen("127.0.0.1:3000").unwrap();
}

// fn register_collada(conn: &mut Connection, object_id: i32, collada_name: &str, texture_id: i32, texture_name: &str) -> rusqlite::Result<()> {
//     let tx = conn.transaction()?;
// 
//     let collada_doc = ColladaDocument::from_path(&Path::new(collada_name)).expect("failed to load dae");
//     let collada_objs = collada_doc.get_obj_set().expect("cannot read obj set");
// 
//     insert_object(&tx, object_id, &collada_name, texture_id).expect("failed to insert sqlite (Object)");
// 
//     // for (i, obj) in collada_objs.objects.iter().enumerate() {
//     //     register_collada_object(&tx, &obj, object_id, i as i32 + 1)
//     // }
// 
//     tx.commit()
// }
// fn register_texture(conn: &mut Connection, object_id: i32, texture_id: i32, texture_name: &str) {
//     let img = open_texture(&std::path::Path::new(texture_name));
//     insert_texture(&tx, texture_id, &texture_name, img).expect("failed to insert sqlite (Texture)");
// }
// 
// fn register_collada_object(tx: &rusqlite::Transaction, obj: &collada::Object, object_id: i32, mesh_id: i32) {
//     let mut i = 0;
//     insert_mesh(&tx, object_id, mesh_id, &obj.name).expect("failed to insert sqlite (Mesh)");
//     for geom in obj.geometry.iter() {
//        let mut add = |a: collada::VTNIndex| {
//            i += 1;
//            insert_vertex(&tx, object_id, mesh_id, &vtn_to_vertex(a, obj), i).ok()
//        };
//        for shape in geom.shapes.iter() {
//            match shape {
//                &collada::Shape::Triangle(a, b, c) => {
//                    add(a);
//                    add(b);
//                    add(c);
//                }
//                _ => {}
//            }
//        }
//     }
// }
// 
// fn insert_texture(tx: &rusqlite::Transaction, texture_id: i32, name: &str, img: Image) -> Result<i32, rusqlite::Error> {
//    let mut stmt = tx.prepare("
// INSERT INTO Texture
//   ( TextureId  
//   , Name     
//   , Width
//   , Height
//   , Data  
//   )
// VALUES 
//   ($1, $2, $3, $4, $5);
// ").expect("failed to insert Texture");
//    stmt.execute(&[&texture_id, &name, &(img.width as i32), &(img.height as i32), &img.data])
// }
// 
// fn insert_mesh(tx: &rusqlite::Transaction, object_id: i32, mesh_id: i32, name: &str) -> Result<i32, rusqlite::Error> {
//    let mut stmt = tx.prepare("
// INSERT INTO Mesh 
//   ( ObjectId
//   , MeshId  
//   , Name    
//   )
// VALUES 
//   ($1, $2, $3);
// ").expect("failed to insert Mesh");
//    stmt.execute(&[&object_id, &mesh_id, &name])
// }
// 
// fn insert_vertex(tx: &rusqlite::Transaction, object_id: i32, mesh_id: i32, v: &Vertex, inx: i32) -> Result<i32, rusqlite::Error> {
// 
//    let mut stmt = tx.prepare("
// INSERT INTO MeshVertex 
//   ( ObjectId     ,
//     MeshId       ,
//     IndexNo      ,
//     PositionX    ,
//     PositionY    ,
//     PositionZ    ,
//     NormalX      ,
//     NormalY      ,
//     NormalZ      ,
//     U            ,
//     V            ,
//     Joint1       ,
//     Joint2       ,
//     Joint3       ,
//     Joint4       ,
//     JointWeight1 ,
//     JointWeight2 ,
//     JointWeight3 ,
//     JointWeight4 )
// VALUES
//   ($1 ,$2 ,$3 ,$4 ,$5 ,$6 ,$7 ,$8 ,$9 ,$10 ,$11 ,$12 ,$13 ,$14 ,$15 ,$16 ,$17 ,$18 ,$19)
// ").expect("failed to insert MeshVertex");
//    stmt.execute(&[&object_id, &mesh_id, &inx,
//                   &(v.pos[0] as f64), &(v.pos[1] as f64), &(v.pos[2] as f64),
//                   &(v.normal[0] as f64), &(v.normal[1] as f64), &(v.normal[2] as f64),
//                   &(v.uv[0] as f64), &(v.uv[1] as f64),
//                   &0,&0,&0,&0,
//                   &0,&0,&0,&0])
// }
// 
// fn query_mesh(conn: &Connection, object_id: i32) -> Vec<Vec<Vertex>> {
//    let mut stmt = conn.prepare("
// SELECT 
//   M.MeshId
// , MV.PositionX   
// , MV.PositionY   
// , MV.PositionZ   
// , MV.NormalX     
// , MV.NormalY     
// , MV.NormalZ     
// , MV.U           
// , MV.V           
// , MV.Joint1      
// , MV.Joint2      
// , MV.Joint3      
// , MV.Joint4      
// , MV.JointWeight1
// , MV.JointWeight2
// , MV.JointWeight3
// , MV.JointWeight4
//   FROM Object AS O
// LEFT JOIN Mesh AS M
//   ON O.ObjectId = M.ObjectId
// LEFT JOIN MeshVertex AS MV
//   ON M.ObjectId = MV.ObjectId
//   and M.MeshId = MV.MeshId
// WHERE O.ObjectId = $1
// Order By MV.ObjectId, MV.MeshId, MV.IndexNo
// ").expect("sql failure:"); 
//    let mut meshes = Vec::new();
//    let result = stmt.query_map(&[&object_id], |r| {
//        ( r.get::<&str,i32>("MeshId") as usize
//        , Vertex { 
//             pos: [ r.get::<&str,f64>("PositionX") as f32
//                  , r.get::<&str,f64>("PositionY") as f32
//                  , r.get::<&str,f64>("PositionZ") as f32],
//             normal: [ r.get::<&str,f64>("NormalX") as f32
//                     , r.get::<&str,f64>("NormalY") as f32
//                     , r.get::<&str,f64>("NormalZ") as f32],
//             uv: [ r.get::<&str,f64>("U") as f32
//                 , r.get::<&str,f64>("V") as f32],
//             joint_indices: [0; 4],
//             joint_weights: [0.0; 4]
//         })
//    }).expect("query failure");
//    for r in result 
//    {
//        let (mesh_id, v) = r.expect("wrap failure");
//        if meshes.len() < mesh_id 
//        { 
//            meshes.push(Vec::new());
//        }
//        meshes[mesh_id - 1].push(v);
//    }
//    meshes
// }
// 
