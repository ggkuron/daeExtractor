extern crate rustc_serialize;
#[macro_use] extern crate nickel;
extern crate nickel_sqlite;
extern crate collada;
use std::path::Path;
use collada::document::ColladaDocument;

use nickel::{Nickel, HttpRouter, JsonBody, MediaType, StaticFilesHandler, Response, Request};
use nickel_sqlite::{SqliteMiddleware, SqliteRequestExtensions};
use nickel::status::StatusCode;

use std::collections::HashMap;

#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct Object {
    ObjectId:  i32,
    Name:      String,
    FileName:  String
}
#[derive(Clone, Debug, PartialEq, RustcEncodable, RustcDecodable)]
#[allow(non_snake_case)]
struct Mesh {
    ObjectId: i32,
    MeshId:   i32,
    // TextureId: i32,
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

struct Vertex {
    pos: [f32; 3],
    normal: [f32; 3],
    uv: [f32; 2],
    joint_indices: [i32; 4],
    joint_weights: [f32; 4],
}

impl Default for Vertex {
    fn default() -> Vertex {
        Vertex {
            pos: [0.0; 3],
            normal: [0.0; 3],
            uv: [0.0; 2],
            joint_indices: [0; 4],
            joint_weights: [0.0; 4]
        }
    }
}



const CREATE_TABLE_OBJECT: &'static str = "
CREATE TABLE Object 
  ( ObjectId    INTEGER PRIMARY KEY,
    Name        TEXT NOT NULL
  );";
const CREATE_TABLE_MESH: &'static str = "
CREATE TABLE Mesh 
  ( ObjectId  INTEGER NOT NULL,
    MeshId    INTEGER NOT NULL,
    Name      TEXT NOT NULL,
    PRIMARY KEY (ObjectId, MeshId)
  );";
const CREATE_TABLE_TEXTURE: &'static str = "
CREATE TABLE Texture
  ( TextureId  INTEGER NOT NULL,
    Name      TEXT NOT NULL,
    Width     INTEGER NOT NULL,
    Height    INTEGER NOT NULL,
    Data   Blob NOT NULL,
    PRIMARY KEY (TextureId)
  );";
const CREATE_TABLE_MESHVERTEX: &'static str = "
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

    match db.execute(CREATE_TABLE_OBJECT, &[]) 
     .and(db.execute(CREATE_TABLE_MESH, &[]))
     .and(db.execute(CREATE_TABLE_MESHVERTEX, &[]))
     .and(db.execute(CREATE_TABLE_TEXTURE, &[])) {
        Err(err) => { println!("{}", err) },
        Ok(_) => {}
    }

    server.utilize(mw);
    server.utilize(StaticFilesHandler::new("static"));
    server.get("/", middleware! { |req, mut rep|
        let db = req.db_conn().unwrap();
        let mut stmt = db.prepare("SELECT * FROM Object").unwrap();
        match stmt.query_map(&[], |row| {
            Object {
                ObjectId  : row.get(0),   
                Name      : row.get(1),    
                FileName  : row.get(1)
            }
        }) {
            Ok(object_iter) => {
                let mut data = HashMap::new();
                let list = object_iter
                    .map(|x| x.unwrap())
                    .collect::<Vec<Object>>();
                data.insert("objects", list);
                rep.set(StatusCode::Ok);
                rep.set(MediaType::Html);
                return rep.render("template/index.tpl", &data);
            },
            Err(err) => {
                rep.set(StatusCode::InternalServerError);
                format!("{}", err);
            }
        };
    });
    server.post("/object/new", middleware! { |res, mut rep| { reg_new_object(res, &mut rep) } });

    server.listen("127.0.0.1:3000").unwrap();
}

fn reg_new_object(req: &mut Request, rep: &mut Response) -> String {
        let json = req.json_as::<Object>().unwrap();
        let conn = req.db_conn().unwrap();

        match conn.execute("
            INSERT INTO Object 
              (ObjectId, Name) 
            VALUES 
              ($1, $2);",
            &[&json.ObjectId, &json.Name]) {
            Ok(_) => {
                let filepath = format!("assets/{}", json.FileName);
                let collada_doc = ColladaDocument::from_path(&Path::new(filepath.as_str())).expect("failed to load dae");
                let collada_objs = collada_doc.get_obj_set().expect("cannot read obj set");

                let mut errors = Vec::new();

                for (mesh_no, obj) in collada_objs.objects.iter().enumerate() {
                    match conn.execute("
                        INSERT INTO Mesh 
                          ( ObjectId
                          , MeshId  
                          , Name    
                          )
                        VALUES 
                          ($1, $2, $3);", &[&json.ObjectId, &(mesh_no as i32), &obj.name]) {
                        Ok(_) => {
                            for geom in obj.geometry.iter() {
                               let mut i = 0;
                               let mut add = |a: collada::VTNIndex| {
                                   i += 1;
                                   let v = vtn_to_vertex(a, obj);
                                   conn.execute("
                                   INSERT INTO MeshVertex 
                                     ( ObjectId     ,
                                       MeshId       ,
                                       IndexNo      ,
                                       PositionX    ,
                                       PositionY    ,
                                       PositionZ    ,
                                       NormalX      ,
                                       NormalY      ,
                                       NormalZ      ,
                                       U            ,
                                       V            ,
                                       Joint1       ,
                                       Joint2       ,
                                       Joint3       ,
                                       Joint4       ,
                                       JointWeight1 ,
                                       JointWeight2 ,
                                       JointWeight3 ,
                                       JointWeight4 )
                                   VALUES
                                     ($1 ,$2 ,$3 ,$4 ,$5 ,$6 ,$7 ,$8 ,$9 ,$10 ,$11 ,$12 ,$13 ,$14 ,$15 ,$16 ,$17 ,$18 ,$19)
                                   ", &[&json.ObjectId, &(mesh_no as i32), &i,
                                        &(v.pos[0] as f64), &(v.pos[1] as f64), &(v.pos[2] as f64),
                                        &(v.normal[0] as f64), &(v.normal[1] as f64), &(v.normal[2] as f64),
                                        &(v.uv[0] as f64), &(v.uv[1] as f64),
                                        &0,&0,&0,&0,
                                        &0,&0,&0,&0])                                     
                               };

                               for shape in geom.shapes.iter() {
                                   match shape {
                                       &collada::Shape::Triangle(a, b, c) => {
                                           match add(a).and(add(b)).and(add(c)) {
                                               Ok(_) => {},
                                               Err(err) => errors.push(format!("{}", err))
                                           }
                                       }
                                       _ => errors.push(format!("not triangulated"))
                                   }
                               }
                            }
                        },
                        Err(err) => errors.push(format!("Could not insert a mesh entry: {}", err))
                    }
                }

                if errors.len() == 0 {
                    format!("Success")
                } else {
                    rep.set(StatusCode::InternalServerError);
                    println!("{}", errors.join("\n"));
                    format!("Failed")
                }
            },
            Err(err) => format!("Could not insert a new entry: {}", err),
        }
}

fn vtn_to_vertex(a: collada::VTNIndex, obj: &collada::Object) -> Vertex {
    let mut vertex: Vertex = Default::default();
    let position = obj.vertices[a.0];
    vertex.pos = [position.x as f32, position.y as f32, position.z as f32];

    if obj.joint_weights.len() == obj.vertices.len() {
        let weights = obj.joint_weights[a.0];
        vertex.joint_weights = weights.weights;
        vertex.joint_indices = [
            weights.joints[0] as i32,
            weights.joints[1] as i32,
            weights.joints[2] as i32,
            weights.joints[3] as i32,
        ];
    }

    if let Some(uv) = a.1 {
        let uv = obj.tex_vertices[uv];
        vertex.uv = [uv.x as f32, uv.y as f32];
    }
    if let Some(normal) = a.2 {
        let normal = obj.normals[normal];
        vertex.normal = [normal.x as f32, normal.y as f32, normal.z as f32];
    }
    vertex
}


// fn register_texture(conn: &mut Connection, object_id: i32, texture_id: i32, texture_name: &str) {
//     let img = open_texture(&std::path::Path::new(texture_name));
//     insert_texture(&tx, texture_id, &texture_name, img).expect("failed to insert sqlite (Texture)");
// }
// 
// fn register_collada_object(tx: &rusqlite::Transaction, obj: &collada::Object, object_id: i32, mesh_id: i32) {
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
// fn open_texture(path: &std::path::Path) -> Image
// {
//     use std::io::BufReader;
//     use png;
//     let fin = std::fs::File::open(path).expect("no such file");
//     let fin = BufReader::new(fin);
//     let dec = png::Decoder::new(fin);
//     let (_, mut reader) = dec.read_info().expect("collada load failure");
//     // let color = reader.output_color_type().into();
//     let mut data = vec![0; reader.output_buffer_size()];
//     reader.next_frame(&mut data).ok();
//     let (w, h) = reader.info().size(); 
// 
//     Image {
//         data: data,
//         width: w as u16,
//         height: h as u16
//     }
// }

