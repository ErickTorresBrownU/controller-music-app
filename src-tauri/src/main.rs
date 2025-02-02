// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use gamepad::GamepadEngine;

fn main() {
    // std::thread::spawn(|| {
    //     let mut gamepad_engine = GamepadEngine::new();
    //     let mut current_gamepad_state = None;

    //     loop {
    //         gamepad_engine.update().unwrap();

    //         match gamepad_engine.gamepads().as_slice() {
    //             [] => todo!(),
    //             [first, ..] => current_gamepad_state = Some(first),
    //         }

    //         if current_gamepad_state.is_none() {
    //             continue;
    //         }

    //         for (key, button) in current_gamepad_state.unwrap().buttons() {
    //             if button.is_just_pressed() {
    //                 println!("Just Pressed: {:?}", key);
    //             }
    //         }
    //     }
    // });

    controller_music_app_lib::run()
}

enum ControllerInput {
    ButtonA,
    ButtonB,
    ButtonX,
    ButtonY,
    DPadUp,
    DPadRight,
    DPadDown,
    DPadLeft,
    BumperLeft,
    BumperRight,
    TriggerLeft(f64),
    TriggerRight(f64),
    ThumbStickLeft(),
}
