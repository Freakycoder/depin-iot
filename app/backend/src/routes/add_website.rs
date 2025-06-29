use crate::entities::website_register;
use crate::middlewares::validator_auth::validator_jwt_middleware;
use axum::middleware;
use axum::{
    Json, Router,
    extract::State,
    routing:: post,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use crate::types::website::{AddWebsiteInput, AddWebsiteResponse};
use crate::types::websocket::AppState;



pub fn add_website_router() -> Router<AppState> {
    Router::new().route("/add", post(website_to_add).layer(middleware::from_fn(validator_jwt_middleware)))
}

#[axum::debug_handler]
async fn website_to_add(
    State(state): State<AppState>, // state represents globally shared data in rust. it is done bcoz we cannot pass db and ws twice using State()
    Json(website_data): Json<AddWebsiteInput>,
) -> Json<AddWebsiteResponse> {
    let url = website_data.url_to_monitor;
    let user_id  = website_data.user_id;
    let db = state.db;
    let ws = state.ws_manager;

    let existing_url = website_register::Entity::find()
        .filter(website_register::Column::WebsiteUrl.eq(&url))
        .one(&db)
        .await;

    if let Err(db_err) = existing_url {
        return Json(AddWebsiteResponse {
            status_code: 500,
            message: format!("db error occured : {}", db_err),
        });
    }

    if let Some(_) = existing_url.unwrap() {
        return Json(AddWebsiteResponse {
            status_code: 409,
            message: format!("website already exist"),
        });
    }

    let new_url = website_register::ActiveModel {
        website_url: Set(url.clone()),
        user_id : Set(user_id),
        ..Default::default()
    };

    let result = new_url.insert(&db).await;

    match result {
        Ok(website_details) => {
            ws.website_to_broadcast(url, website_details.id);
            return Json(AddWebsiteResponse {
                status_code: 200,
                message: format!("New URL registered succesfully"),
            });
        }
        Err(db_err) => {
            return Json(AddWebsiteResponse {
                status_code: 404,
                message: format!("Db error occured : {}", db_err),
            });
        }
    }
}