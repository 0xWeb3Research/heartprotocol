module heartprotocol::core {
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use std::signer;
    // use aptos_framework::account;

    // Error codes
    const ERROR_PROFILE_ALREADY_EXISTS: u64 = 1;
    const ERROR_PROFILE_NOT_FOUND: u64 = 2;

    struct Profile has store {
        name: String,
        userdata: String,
    }

    struct AppState has key {
        profiles: Table<address, Profile>,
    }

    fun initialize(account: &signer) {
        if (!exists<AppState>(@heartprotocol)) {
            move_to(account, AppState {
                profiles: table::new(),
            });
        };
    }

    public entry fun create_profile(
        account: &signer,
        name: String,
        userdata: String,
    ) acquires AppState {
        let sender = signer::address_of(account);

        // Initialize if AppState doesn't exist
        if (!exists<AppState>(@heartprotocol)) {
            initialize(account);
        };

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(!table::contains(&app_state.profiles, sender), ERROR_PROFILE_ALREADY_EXISTS);

        let profile = Profile {
            name,
            userdata,
        };

        table::add(&mut app_state.profiles, sender, profile);
    }

    #[view]
    public fun get_profile(user: address): (String, String) acquires AppState {
        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow(&app_state.profiles, user);
        (profile.name, profile.userdata)
    }
}