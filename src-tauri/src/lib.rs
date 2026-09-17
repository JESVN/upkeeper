//! The module tree and the Tauri builder; no logic ([src-tauri/README.md](../README.md)).
//!
//! The stages under `core/`, the providers, and the platform layer arrive with
//! the milestones that need them; this file registers what exists.

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
