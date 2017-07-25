extern crate iron;
extern crate router;
#[macro_use] extern crate serde_derive;
extern crate collada;
extern crate png;
extern crate rusqlite;
extern crate serde;
extern crate serde_json;
extern crate bodyparser;

use std::path::Path;
use collada::document::ColladaDocument;

use iron::status;
use iron::prelude::*;
use iron::mime;
use iron::method::Method;
use iron::{ AfterMiddleware, headers};

use rusqlite::Connection;

use router::Router;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Object {
    ObjectId:  i32,
    Name:      String,
    FileName:  String
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Mesh {
    ObjectId  : i32,
    MeshId    :i32,
    TextureId : i32,
    Name      : String,
    VertexCount: i32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Texture {
    TextureId: i32,
    Width:     i32,
    Height:    i32,
    Data:      Vec<u8>,
    FileName:  String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[allow(non_snake_case)]
struct Animation {
    AnimationId:  i32,
    ObjectId: i32,
    JointIndex: i32,
    Name:      String,
    FileName:  String,
    Target: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
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
            joint_weights: [1.0; 4]
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
    TextureId INTEGER NOT NULL,
    Name      TEXT NOT NULL,
    PRIMARY KEY (ObjectId, MeshId)
  );";
const CREATE_TABLE_TEXTURE: &'static str = "
CREATE TABLE Texture
  ( TextureId  INTEGER NOT NULL,
    Width     INTEGER NOT NULL,
    Height    INTEGER NOT NULL,
    Data   Blob NOT NULL,
    FileName TEXT NOT NULL,
    PRIMARY KEY (TextureId)
  );";
const CREATE_TABLE_MESHVERTEX: &'static str = "
CREATE TABLE MeshVertex 
  ( ObjectId      INTEGER NOT NULL,
    MeshId        INTEGER NOT NULL, 
    IndexNo       INTEGER NOT NULL,
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
const CREATE_TABLE_JOINT: &'static str = "
CREATE TABLE Joint 
  ( ObjectId     INTEGER NOT NULL,
    JointIndex   INTEGER NOT NULL,
    Name         TEXT  NOT NULL,
    ParentIndex  INTEGER NOT NULL,
    BindPose11   REAL NOT NULL,
    BindPose12   REAL NOT NULL,
    BindPose13   REAL NOT NULL,
    BindPose14   REAL NOT NULL,
    BindPose21   REAL NOT NULL,
    BindPose22   REAL NOT NULL,
    BindPose23   REAL NOT NULL,
    BindPose24   REAL NOT NULL,
    BindPose31   REAL NOT NULL,
    BindPose32   REAL NOT NULL,
    BindPose33   REAL NOT NULL,
    BindPose34   REAL NOT NULL,
    BindPose41   REAL NOT NULL,
    BindPose42   REAL NOT NULL,
    BindPose43   REAL NOT NULL,
    BindPose44   REAL NOT NULL,
    InverseBindPose11  REAL NOT NULL,
    InverseBindPose21  REAL NOT NULL,
    InverseBindPose31  REAL NOT NULL,
    InverseBindPose41  REAL NOT NULL,
    InverseBindPose12  REAL NOT NULL,
    InverseBindPose22  REAL NOT NULL,
    InverseBindPose32  REAL NOT NULL,
    InverseBindPose42  REAL NOT NULL,
    InverseBindPose13  REAL NOT NULL,
    InverseBindPose23  REAL NOT NULL,
    InverseBindPose33  REAL NOT NULL,
    InverseBindPose43  REAL NOT NULL,
    InverseBindPose14  REAL NOT NULL,
    InverseBindPose24  REAL NOT NULL,
    InverseBindPose34  REAL NOT NULL,
    InverseBindPose44  REAL NOT NULL,
    PRIMARY KEY (ObjectId, JointIndex)
  );
";
const CREATE_TABLE_ANIMATION: &'static str = "
CREATE TABLE Animation 
  ( 
    AnimationId    INTEGER NOT NULL,
    ObjectId       INTEGER NOT NULL,
    JointIndex     INTEGER NOT NULL,
    SampleTime     REAL NOT NULL,
    SamplePose11   REAL NOT NULL,
    SamplePose12   REAL NOT NULL,
    SamplePose13   REAL NOT NULL,
    SamplePose14   REAL NOT NULL,
    SamplePose21   REAL NOT NULL,
    SamplePose22   REAL NOT NULL,
    SamplePose23   REAL NOT NULL,
    SamplePose24   REAL NOT NULL,
    SamplePose31   REAL NOT NULL,
    SamplePose32   REAL NOT NULL,
    SamplePose33   REAL NOT NULL,
    SamplePose34   REAL NOT NULL,
    SamplePose41   REAL NOT NULL,
    SamplePose42   REAL NOT NULL,
    SamplePose43   REAL NOT NULL,
    SamplePose44   REAL NOT NULL,
    Name           TEXT  NOT NULL,
    Target         TEXT  NOT NULL,
    FileName       TEXT  NOT NULL,
    PRIMARY KEY (ObjectId, AnimationId, SampleTime, JointIndex)
  );
";



fn open_sqlite() -> Connection {
    let db_file = "file.db";
    Connection::open(&Path::new(db_file)).expect("failed to open sqlite file")
}


struct CORS {}

impl CORS {
    pub fn new() -> Self {
        CORS {
        }
    }
    fn add_headers(res: &mut Response) {
        res.headers.set(headers::AccessControlAllowOrigin::Value("http://localhost:8080".to_owned()));
        res.headers.set(headers::AccessControlAllowHeaders(vec![
                                          "Origin".into(),
                                          "Content-Type".into(),
                                          "Accept".into(),
        ]));
        res.headers.set(headers::AccessControlAllowMethods(vec![
            Method::Get,
            Method::Post,
            Method::Put,
            Method::Delete,
        ]));
    }
}
impl AfterMiddleware for CORS {
    fn after(&self, req: &mut Request, mut res: Response) -> IronResult<Response> {
        if req.method == Method::Options {
            res = Response::with(status::Ok);
        }
        CORS::add_headers(&mut res);

        Ok(res)
    }
}



fn main() {

    {
        let conn = open_sqlite();
        if let Err(err) = conn.execute(CREATE_TABLE_OBJECT, &[]) 
            .and(conn.execute(CREATE_TABLE_MESH, &[]))
            .and(conn.execute(CREATE_TABLE_MESHVERTEX, &[]))
            .and(conn.execute(CREATE_TABLE_TEXTURE, &[])) 
            .and(conn.execute(CREATE_TABLE_JOINT, &[]))
            .and(conn.execute(CREATE_TABLE_ANIMATION, &[])) {
            println!("{:?}", err)  // just ignore
        }
    }

    let mut router = Router::new();

    router.get("/objects", list_object, "list-object");
    fn list_object(_: &mut Request) -> IronResult<Response> {
        let conn = open_sqlite();
        let mut stmt = conn.prepare("SELECT ObjectId, Name FROM Object").unwrap();

        let result = match stmt.query_map(&[], |row| {
            Object {
                ObjectId  : row.get(0),   
                Name      : row.get(1),    
                FileName  : row.get(1),    // not exists for now
            }
        }) {
            Ok(object_iter) => {
                let list = object_iter
                    .map(|x| x.unwrap())
                    .collect::<Vec<_>>();
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&list).unwrap())))
            },
            Err(err) => {
                println!("Failed: {}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.get("/object/:id", get_object, "get-object");
    fn get_object(req: &mut Request) -> IronResult<Response> { 
        let id = req.extensions.get::<Router>().unwrap().find("id").unwrap();
        let conn = open_sqlite();
        let mut stmt = conn.prepare("
        SELECT 
          ObjectId,
          MeshId,
          TextureId,
          Name,
          (SELECT 
             COUNT(*)
             FROM MeshVertex AS V
           WHERE V.ObjectId = Mesh.ObjectId
             and V.MeshId = Mesh.MeshId) AS Vertex
          FROM Mesh
        WHERE ObjectId = ?1").unwrap();
        let result = match stmt.query_map(&[&id], |row| {
            Mesh {
                ObjectId  : row.get(0),   
                MeshId    : row.get(1),
                TextureId : row.get(2),
                Name      : row.get(3),    
                VertexCount: row.get(4),
            }
        }) {
            Ok(object_iter) => {
                let list = object_iter
                    .map(|x| x.unwrap())
                    .collect::<Vec<_>>();
                Ok(Response::with((status::Ok, serde_json::to_string(&list).unwrap())))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.get("/textures", list_texture, "list-texture");

    fn list_texture(_: &mut Request) -> IronResult<Response> {
        let conn = open_sqlite();
        let mut stmt = conn.prepare("SELECT * FROM Texture").unwrap();
        let result = match stmt.query_map(&[], |row| {
            Texture {
                TextureId  : row.get(0),
                Width : row.get(1),
                Height : row.get(2),
                Data  : row.get(3),
                FileName  : row.get(4)
            }
        }) {
            Ok(object_iter) => {
                let list = object_iter
                    .map(|x| x.unwrap())
                    .collect::<Vec<_>>();
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&list).unwrap())))
            },
            Err(err) => {
                println!("Failed: {}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.put("/texture/new", create_texture, "create-texture");
    fn create_texture(mut req: &mut Request) -> IronResult<Response> {
        let mut conn = open_sqlite();
        reg_new_texture(&mut conn, &mut req) 
    }

    router.get("/animations", list_animations, "list-animation");
    fn list_animations(_: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();
        let mut stmt = conn.prepare(
        "SELECT DISTINCT
           AnimationId,
           ObjectId,
           JointIndex,
           Name,
           FileName,
           Target
           FROM Animation").unwrap();
        let result = match stmt.query_map(&[], |row| {
            Animation {
                AnimationId  : row.get(0),
                ObjectId: row.get(1),
                JointIndex: row.get(2),
                Name: row.get(3),     
                FileName:  row.get(4),
                Target: row.get(5),
            }
        }) {
            Ok(object_iter) => {
                let list = object_iter
                    .map(|x| x.unwrap())
                    .collect::<Vec<_>>();
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&list).unwrap())))
            },
            Err(err) => {
                println!("Failed: {}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.put("/animation/new", create_animation, "create-animation");
    fn create_animation(req: &mut Request) -> IronResult<Response> { 
        let mut conn = open_sqlite();
        let json = req.get::<bodyparser::Struct<Animation>>().unwrap().unwrap();
        match reg_new_animation(&mut conn, json) {
           Ok(_) => {
                Ok(Response::with(status::Ok))
           },
           Err(err) => { 
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
           }
        }
    }

    router.put("/animation/update", update_animation, "update-animation");
    fn update_animation(req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();
        let json = req.get::<bodyparser::Struct<Animation>>().unwrap().unwrap();

        let result = match conn.execute("
            UPDATE Animation 
            SET
              ObjectId = ?2,
              Name = ?3,
              JointIndex = ?4
            WHERE AnimationId = ?1
            ;", &[&json.AnimationId, &json.ObjectId, &json.Name, &json.JointIndex])
        {
            Ok(updated) => {
                println!("Updated: {}", updated);
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&updated).unwrap())))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.delete("/animation/delete/:id", delete_animation, "delete-animation");
    fn delete_animation(req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();
        let id = req.extensions.get::<Router>().unwrap().find("id").unwrap();

        let result = match conn.execute("
            DELETE FROM Animation 
            WHERE 
              AnimationId = ?1
            ;", &[&id])
        {
            Ok(_) => {
                Ok(Response::with(status::Ok))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    } 

    router.put("/object/new", create_object, "create-object");
    fn create_object(req: &mut Request) -> IronResult<Response> { 
        let mut conn = open_sqlite();
        let json = req.get::<bodyparser::Struct<Object>>().unwrap().unwrap();
        match reg_new_object(&mut conn, json) {
           Ok(_) => {
               Ok(Response::with(status::Ok))
           },
           Err(err) => { 
               println!("{:?}", err);
               Ok(Response::with(status::InternalServerError))
           }
        }
    }

    router.delete("/object/delete/:id", delete_object, "delete-object");
    fn delete_object(req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();
        let id = req.extensions.get::<Router>().unwrap().find("id").unwrap();

        match conn.execute("
            DELETE FROM Object 
            WHERE 
              ObjectId = ?1
            ;",
            &[&id])
            .and(conn.execute("
            DELETE FROM Mesh 
            WHERE 
              ObjectId = ?1
            ;", &[&id]))
            .and(conn.execute("
            DELETE FROM MeshVertex 
            WHERE 
              ObjectId = ?1
            ;", &[&id]))
            .and(conn.execute("
            DELETE FROM JOINT
            WHERE 
                ObjectId = ?1
            ;", &[&id]))
            {
                Ok(_) => {
                    Ok(Response::with(status::Ok))
                },
                Err(err) => {
                    println!("Failed: {}", err);
                    Ok(Response::with(status::InternalServerError))
                }
            }
    } 

    router.delete("/texture/delete/:id", delete_texture, "delete-texture");
    fn delete_texture(req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();
        let id = req.extensions.get::<Router>().unwrap().find("id").unwrap();

        match conn.execute("
            DELETE FROM Texture 
            WHERE 
              TextureId = ?1
            ;", &[&id])
        {
            Ok(_) => {
                Ok(Response::with(status::Ok))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        }
    } 

    router.put("/texture/update", update_texture, "update-texture");
    fn update_texture(req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();

        #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
        #[allow(non_snake_case)]
        struct Target {
            TextureId: i32,
            FileName: String,
        }

        let json = req.get::<bodyparser::Struct<Target>>().unwrap().unwrap();

        let result = match conn.execute("
            UPDATE Texture 
            SET FileName = ?2
            WHERE TextureId = ?1
            ;", &[&json.TextureId, &json.FileName])
        {
            Ok(updated) => {
                println!("Updated: {}", updated);
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&updated).unwrap())))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.put("/object/update", update_object, "update-object");
    fn update_object(mut req: &mut Request) -> IronResult<Response> { 
        let conn = open_sqlite();

        #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
        #[allow(non_snake_case)]
        struct Target {
            ObjectId: i32,
            Name: String,
            FileName: String,
        }

        let json = req.get::<bodyparser::Struct<Target>>().unwrap().unwrap();

        let result = match conn.execute("
            UPDATE Object 
            SET Name = ?2
            WHERE ObjectId = ?1
            ;", &[&json.ObjectId, &json.Name])
        {
            Ok(updated) => {
                println!("Updated: {}", updated);
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&updated).unwrap())))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    }

    router.put("/mesh/update", update_mesh, "update-mesh");
    fn update_mesh(mut req: &mut Request) -> IronResult<Response> {
        let conn = open_sqlite();

        #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
        #[allow(non_snake_case)]
        struct Target {
            ObjectId: i32,
            MeshId: i32,
            TextureId: i32
        }

        let json = req.get::<bodyparser::Struct<Target>>().unwrap().unwrap();

        let result = match conn.execute("
            UPDATE Mesh 
            SET TextureId = ?3
            WHERE ObjectId = ?1
              and MeshId = ?2
            ;", &[&json.ObjectId, &json.MeshId, &json.TextureId])
        {
            Ok(updated) => {
                println!("Updated: {:?}", updated);
                let content_type = mime::Mime(iron::mime::TopLevel::Application, iron::mime::SubLevel::Json, vec![]);
                Ok(Response::with((content_type, status::Ok, serde_json::to_string(&updated).unwrap())))
            },
            Err(err) => {
                println!("Failed: {:?}", err);
                Ok(Response::with(status::InternalServerError))
            }
        };
        result
    } 

    let mut chain = Chain::new(router);
    // let cors_middleware = CorsMiddleware::with_allow_any(true);

    chain.link_after(CORS::new());
    Iron::new(chain).http("127.0.0.1:3000").unwrap();
}

fn reg_new_texture (conn: &mut Connection, req: &mut Request) -> IronResult<Response> {
        #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
        #[allow(non_snake_case)]
        struct FileId {
            TextureId: i32,
            FileName: String,
        }
        let json = req.get::<bodyparser::Struct<FileId>>().unwrap().unwrap();

        let filepath = format!("assets/texture/{}", json.FileName);
        let img = open_texture(&std::path::Path::new(filepath.as_str()));

        let result = match conn.execute("
        INSERT INTO Texture
          ( TextureId  
          , Width
          , Height
          , Data  
          , FileName     
          )
        VALUES 
          (?1, ?2, ?3, ?4, ?5);"
        , &[&json.TextureId, &(img.width as i32), &(img.height as i32), &img.data, &json.FileName]) {
            Ok(ok) => {
                Ok(Response::with((status::Ok, ok.to_string())))
            },
            Err(err) => { 
                println!("{:?}", err);
                Ok(Response::with((status::InternalServerError, err.to_string())))
            }
        };
        result
}

fn reg_new_object(conn: &mut Connection, json: Object) -> Result<(), String> {
    let tx = conn.transaction().unwrap();

    match insert_object(&tx, json.ObjectId, &json.Name) {
        Ok(_) => {
            let filepath = format!("assets/dae/{}", json.FileName);
            let collada_doc = ColladaDocument::from_path(&Path::new(filepath.as_str())).expect("failed to load dae");
            let collada_objs = collada_doc.get_obj_set().expect("cannot read obj set");

            let mut errors = Vec::new();

            for (mesh_no, obj) in collada_objs.objects.iter().enumerate() {
                let mesh_no = mesh_no + 1;
                println!("{}", mesh_no);

                match insert_mesh(&tx, json.ObjectId, mesh_no as i32, &obj.name) {
                    Ok(_) => {
                        for geom in obj.geometry.iter() {
                           let mut i = 0;
                           let mut add = |a: collada::VTNIndex| {
                               i += 1;
                               insert_vertex(&tx, json.ObjectId, mesh_no as i32, &vtn_to_vertex(a, obj), i)
                           };

                           for shape in geom.shapes.iter() {
                               match shape {
                                   &collada::Shape::Triangle(a, b, c) => {
                                       if let Err(err) =  add(a).and(add(b)).and(add(c)) {
                                           errors.push(format!("{}", err))
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

            if let Some(skels) = collada_doc.get_skeletons() {
                for s in skels {
                    println!("{}", s.joints.len());
                    for (i, j) in s.joints.iter().enumerate() {
                        insert_joint(
                            &tx,
                            json.ObjectId,
                            i as i32,
                            &j.name,
                            j.parent_index as i32, 
                            s.bind_poses.get(i).unwrap(),
                            j.inverse_bind_pose
                        ).unwrap();
                    }
                }
            }

            if errors.len() == 0 {
                if let Err(err) = tx.commit() {
                   errors.push(format!("{}", err)) 
                }
            }

            if errors.len() == 0 {
                Ok(())
            } else {
                Err(errors.join("\n"))
            }
        },
        Err(err) => Err(format!("{}", err))
    }
}

fn reg_new_animation(conn: &mut Connection, json: Animation) -> Result<(), String> {

    let tx = conn.transaction().unwrap();
    let mut errors = Vec::new();

    let filepath = format!("assets/dae/{}", json.FileName);
    let collada_doc = ColladaDocument::from_path(&Path::new(filepath.as_str())).expect("failed to load dae");
    for (n, a) in collada_doc.get_animations().iter().enumerate() {
        let mut stmt = tx.prepare("SELECT JointIndex FROM Joint WHERE ?1 LIKE (Name ||'%') ").unwrap();
        let joint_index = match stmt.query_map(&[&a.target], |row| { row.get::<i32,i32>(0) }) { 

            Ok(itr) => {
                let e = itr.map(|i| i.unwrap()).collect::<Vec<i32>>();
                if e.len() == 0 { 0 } else { e.get(0).unwrap().clone() }
            },
            _ => -1
        };
        for (i, time) in a.sample_times.iter().enumerate()
        {
            if let Some(pose) = a.sample_poses.get(i) {
                if let Err(err) = insert_animation(&tx, json.AnimationId + n as i32, json.ObjectId, time, joint_index, &json.Name, pose, &json.FileName, &a.target) {
                    errors.push(format!("{:?}", err))
                }
            } else {
                errors.push(format!("{:?}", "pose not found"))
            }
        }
    }

    if errors.len() == 0 {
        if let Err(err) = tx.commit() {
           Err(format!("{:?}", err)) 
        } else { Ok(()) }
    } else {
        Err(errors.join("\n"))
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
 
struct Image {
    data: Vec<u8>,
    width: u16,
    height: u16
}
fn open_texture(path: &std::path::Path) -> Image
{
    use std::io::BufReader;
    use png;
    let fin = std::fs::File::open(path).expect("no such file");
    let fin = BufReader::new(fin);
    let dec = png::Decoder::new(fin);
    let (_, mut reader) = dec.read_info().expect("collada load failure");
    // let color = reader.output_color_type().into();
    let mut data = vec![0; reader.output_buffer_size()];
    reader.next_frame(&mut data).ok();
    let (w, h) = reader.info().size(); 

    Image {
        data: data,
        width: w as u16,
        height: h as u16
    }
}

fn insert_vertex(tx: &rusqlite::Transaction, object_id: i32, mesh_id: i32, v: &Vertex, inx: i32) -> Result<i32, rusqlite::Error> {
   tx.prepare("
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
  (?1 ,?2 ,?3 ,?4 ,?5 ,?6 ,?7 ,?8 ,?9 ,?10 ,?11 ,?12 ,?13 ,?14 ,?15 ,?16 ,?17 ,?18 ,?19)
").and_then(|mut s| s.execute(&[&object_id, &mesh_id, &inx,
                                &(v.pos[0] as f64), &(v.pos[1] as f64), &(v.pos[2] as f64),
                                &(v.normal[0] as f64), &(v.normal[1] as f64), &(v.normal[2] as f64),
                                &(v.uv[0] as f64), &(v.uv[1] as f64),
                                &(v.joint_indices[0]),&(v.joint_indices[1]),&(v.joint_indices[2]),&(v.joint_indices[3]),
                                &(v.joint_weights[0] as f64),&(v.joint_weights[1] as f64),&(v.joint_weights[2] as f64),&(v.joint_weights[3] as f64)
                               ]))
}

fn insert_mesh(tx: &rusqlite::Transaction, object_id: i32, mesh_id: i32, name: &str) -> Result<i32, rusqlite::Error> {
   tx.prepare("
INSERT INTO Mesh 
  ( ObjectId
  , MeshId  
  , TextureId
  , Name    
  )
VALUES 
  (?1, ?2, 0, ?3);
").and_then(|mut s| s.execute(&[&object_id, &mesh_id, &name]))
}

fn insert_object(tx: &rusqlite::Transaction, object_id: i32, name: &str) -> Result<i32, rusqlite::Error> {
   tx.prepare("
INSERT INTO Object 
  (ObjectId, Name) 
VALUES 
  (?1, ?2);
").and_then(|mut s| s.execute(&[&object_id, &name]))
}

fn insert_joint(tx: &rusqlite::Transaction, object_id: i32, index: i32, name: &str, parent: i32, 
                bind: &[[f32;4];4], inverse: [[f32;4];4]) 
                -> Result<i32, rusqlite::Error> {
   tx.prepare("
INSERT INTO Joint
  ( ObjectId     ,
    JointIndex   ,
    Name         ,
    ParentIndex  ,
    BindPose11,
    BindPose12,
    BindPose13,
    BindPose14,
    BindPose21,
    BindPose22,
    BindPose23,
    BindPose24,
    BindPose31,
    BindPose32,
    BindPose33,
    BindPose34,
    BindPose41,
    BindPose42,
    BindPose43,
    BindPose44,
    InverseBindPose11  ,
    InverseBindPose12  ,
    InverseBindPose13  ,
    InverseBindPose14  ,
    InverseBindPose21  ,
    InverseBindPose22  ,
    InverseBindPose23  ,
    InverseBindPose24  ,
    InverseBindPose31  ,
    InverseBindPose32  ,
    InverseBindPose33  ,
    InverseBindPose34  ,
    InverseBindPose41  ,
    InverseBindPose42  ,
    InverseBindPose43  ,
    InverseBindPose44  
  )
VALUES
  (?1 ,?2 ,?3 ,?4 ,
   ?5 ,?6 ,?7 ,?8 ,?9 ,?10 ,?11 ,?12 ,?13 ,?14 ,?15 ,?16 ,?17 ,?18 ,?19, ?20,
   ?21 ,?22 ,?23 ,?24 ,?25 ,?26 ,?27 ,?28 ,?29 ,?30 ,?31 ,?32 ,?33 ,?34 ,?35, ?36
  )
").and_then(|mut s| s.execute(&[&object_id, &index, &name, &parent,
                                &(bind[0][0] as f64), 
                                &(bind[1][0] as f64), 
                                &(bind[2][0] as f64), 
                                &(bind[3][0] as f64), 
                                &(bind[0][1] as f64), 
                                &(bind[1][1] as f64), 
                                &(bind[2][1] as f64), 
                                &(bind[3][1] as f64), 
                                &(bind[0][2] as f64), 
                                &(bind[1][2] as f64), 
                                &(bind[2][2] as f64), 
                                &(bind[3][2] as f64), 
                                &(bind[0][3] as f64), 
                                &(bind[1][3] as f64), 
                                &(bind[2][3] as f64), 
                                &(bind[3][3] as f64), 
                                &(inverse[0][0] as f64), 
                                &(inverse[1][0] as f64), 
                                &(inverse[2][0] as f64), 
                                &(inverse[3][0] as f64), 
                                &(inverse[0][1] as f64), 
                                &(inverse[1][1] as f64), 
                                &(inverse[2][1] as f64), 
                                &(inverse[3][1] as f64), 
                                &(inverse[0][2] as f64), 
                                &(inverse[1][2] as f64), 
                                &(inverse[2][2] as f64), 
                                &(inverse[3][2] as f64), 
                                &(inverse[0][3] as f64), 
                                &(inverse[1][3] as f64), 
                                &(inverse[2][3] as f64), 
                                &(inverse[3][3] as f64), 
                               ]))
}

fn insert_animation(tx: &rusqlite::Transaction, animation_id: i32, object_id: i32, time: &f32, joint_index: i32, name: &str, pose: &[[f32;4];4], filename: &str, target: &str) 
                -> Result<i32, rusqlite::Error> {
   tx.prepare("
INSERT INTO Animation 
  ( 
    AnimationId  ,
    ObjectId     ,
    JointIndex   ,
    SampleTime   ,
    SamplePose11 ,
    SamplePose12 ,
    SamplePose13 ,
    SamplePose14 ,
    SamplePose21 ,
    SamplePose22 ,
    SamplePose23 ,
    SamplePose24 ,
    SamplePose31 ,
    SamplePose32 ,
    SamplePose33 ,
    SamplePose34 ,
    SamplePose41 ,
    SamplePose42 ,
    SamplePose43 ,
    SamplePose44 ,
    Target,
    Name,
    FileName
  )
VALUES
  (?1 ,?2 , ?3 , ?4,
   ?5 ,?6 ,?7 ,?8 ,?9 ,?10 ,?11 ,?12 ,?13 ,?14 ,?15 ,?16 ,?17 ,?18, ?19, ?20 ,
   ?21, ?22, ?23)
").and_then(|mut s| s.execute(&[&animation_id,
                                &object_id, 
                                &joint_index, 
                                &(*time as f64), 
                                &(pose[0][0] as f64), 
                                &(pose[1][0] as f64), 
                                &(pose[2][0] as f64), 
                                &(pose[3][0] as f64), 
                                &(pose[0][1] as f64), 
                                &(pose[1][1] as f64), 
                                &(pose[2][1] as f64), 
                                &(pose[3][1] as f64), 
                                &(pose[0][2] as f64), 
                                &(pose[1][2] as f64), 
                                &(pose[2][2] as f64), 
                                &(pose[3][2] as f64), 
                                &(pose[0][3] as f64), 
                                &(pose[1][3] as f64), 
                                &(pose[2][3] as f64), 
                                &(pose[3][3] as f64), 
                                &target,
                                &name,
                                &filename,
                                    ])) 
}


