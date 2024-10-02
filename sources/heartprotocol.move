module heartprotocol::core {
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use std::signer;
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::vector;

    // Error codes
    const ERROR_PROFILE_ALREADY_EXISTS: u64 = 1;
    const ERROR_PROFILE_NOT_FOUND: u64 = 2;
    const ERROR_PROFILE_NOT_ACTIVATED: u64 = 3;
    const NOT_ENOUGH_BALANCE: u64 = 4;
    const ERROR_INSUFFICIENT_FUNDS: u64 = 5;
    const ERROR_NOT_A_MATCHMAKER: u64 = 6;
    const ERROR_PROFILE_NOT_PUBLIC: u64 = 7;

    const ACTIVATION_COST: u64 = 100_000_000;
    const MATCHMAKER_COST: u64 = 100_000_000;

    struct Recommendation has store, copy {
        recommender: address,
        match: address,
    }

    struct Profile has store {
        name: String,
        bio: String,
        about_me: String,
        interests: String,
        image: String,
        location: String,
        height: String,
        gender: String,
        favoritechain: String,
        relationship_type: String,
        activated: bool,
        matchmaker: bool,
        earned: u64,
        recommendations: vector<Recommendation>,
        is_public: bool,
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
        bio: String,
        about_me: String,
        interests: String,
        image: String,
        location: String,
        height: String,
        gender: String,
        favoritechain: String,
        relationship_type: String,
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
            bio,
            about_me,
            interests,
            image,
            location,
            height,
            gender,
            favoritechain,
            relationship_type,
            activated: false,
            matchmaker: false,
            earned: 0,
            recommendations:  vector::empty<Recommendation>(),
            is_public: false,
        };

        table::add(&mut app_state.profiles, sender, profile);
    }

    #[view]
    public fun get_profile(user: address): (String, String, String, String, String, String, String, String, String, String, bool, bool, u64, vector<Recommendation>, bool) acquires AppState {
        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow(&app_state.profiles, user);
        (
            profile.name,
            profile.bio,
            profile.about_me,
            profile.interests,
            profile.image,
            profile.location,
            profile.height,
            profile.gender,
            profile.favoritechain,
            profile.relationship_type,
            profile.activated,
            profile.matchmaker,
            profile.earned,
            profile.recommendations,
            profile.is_public,
        )
    }

    #[view]
    public fun get_recommendations(user: address): vector<Recommendation> acquires AppState {
        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow(&app_state.profiles, user);

        profile.recommendations
    }

    entry public fun update_profile(
        account: &signer,
        name: String,
        bio: String,
        about_me: String,
        interests: String,
        image: String,
        location: String,
        height: String,
        gender: String,
        favoritechain: String,
        relationship_type: String,
    ) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);
        profile.name = name;
        profile.bio = bio;
        profile.about_me = about_me;
        profile.interests = interests;
        profile.image = image;
        profile.location = location;
        profile.height = height;
        profile.gender = gender;
        profile.favoritechain = favoritechain;
        profile.relationship_type = relationship_type;
    }

    entry public fun activate_profile(account: &signer) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);

        // Define the amount to transfer (1 APT = 100000000 base units)
        let amount = ACTIVATION_COST;
        let platform_address = @heartprotocol;

        // Check if the account has enough balance
        let balance = coin::balance<AptosCoin>(sender);
        assert!(balance >= amount, NOT_ENOUGH_BALANCE);

        // Transfer 1 APT to the platform contract address
        coin::transfer<AptosCoin>(account, platform_address, amount);

        profile.activated = true;
    }

    entry public fun become_matchmaker(account: &signer) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);

        // Define the amount to transfer (1 APT = 100000000 base units)
        let amount = MATCHMAKER_COST;
        let platform_address = @heartprotocol;

        // Check if the account has enough balance
        let balance = coin::balance<AptosCoin>(sender);
        assert!(balance >= amount, NOT_ENOUGH_BALANCE);

        // Transfer 1 APT to the platform contract address
        coin::transfer<AptosCoin>(account, platform_address, amount);

        profile.matchmaker = true;
    }

    #[view]
    public fun is_matchmaker(user: address): bool acquires AppState {
        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow(&app_state.profiles, user);
        profile.matchmaker
    }
    
    fun deactivate_profile(account: &signer) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);
        profile.activated = false;
    }

    entry public fun toggle_public_status(account: &signer) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);
        profile.is_public = !profile.is_public;
    }

    entry public fun add_recommendation(account: &signer, recommended_profile: address) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, recommended_profile), ERROR_PROFILE_NOT_FOUND);

        let matchmaker_profile = table::borrow(&app_state.profiles, sender);
        assert!(matchmaker_profile.matchmaker, ERROR_NOT_A_MATCHMAKER);
        assert!(matchmaker_profile.activated, ERROR_PROFILE_NOT_ACTIVATED);

        let profile = table::borrow_mut(&mut app_state.profiles, recommended_profile);
        assert!(profile.is_public, ERROR_PROFILE_NOT_PUBLIC);

        let recommendation = Recommendation {
            recommender: sender,
            match: recommended_profile,
        };

        vector::push_back(&mut profile.recommendations, recommendation);
    }
}