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

    struct Profile has store, copy {
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

    struct ProfileAddresses has key {
        addresses: vector<address>,
    }

    fun initialize(account: &signer) {
        if (!exists<AppState>(@heartprotocol)) {
            move_to(account, AppState {
                profiles: table::new(),
            });
            move_to(account, ProfileAddresses {
                addresses: vector::empty<address>(),
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
    ) acquires AppState, ProfileAddresses  {
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
        let profile_addresses = borrow_global_mut<ProfileAddresses>(@heartprotocol);
        vector::push_back(&mut profile_addresses.addresses, sender);
    }

    #[view]
    public fun get_total_profiles(): u64 acquires ProfileAddresses {
        assert!(exists<ProfileAddresses>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let profile_addresses = borrow_global<ProfileAddresses>(@heartprotocol);
        vector::length(&profile_addresses.addresses)
    }

    fun list_profiles_paginated(start_index: u64, limit: u64): vector<address> acquires ProfileAddresses {
        assert!(exists<ProfileAddresses>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let profile_addresses = borrow_global<ProfileAddresses>(@heartprotocol);
        let total_profiles = vector::length(&profile_addresses.addresses);
        
        // Ensure start_index is within bounds
        if (start_index >= total_profiles) {
            return vector::empty<address>()
        };

        // Calculate the end index
        let end_index = if (start_index + limit > total_profiles) {
            total_profiles
        } else {
            start_index + limit
        };

        // Create a new vector to store the paginated results
        let result = vector::empty<address>();
        let i = start_index;
        while (i < end_index) {
            let addr = *vector::borrow(&profile_addresses.addresses, i);
            vector::push_back(&mut result, addr);
            i = i + 1;
        };

            result
    }

    fun get_profile_internal(user: address): Profile acquires AppState {
        let app_state = borrow_global<AppState>(@heartprotocol);
        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);
        *table::borrow(&app_state.profiles, user)
    }


    #[view]
    public fun get_paginated_profile_data(start_index: u64, limit: u64): vector<Profile> acquires AppState, ProfileAddresses {
        let profile_addresses = list_profiles_paginated(start_index, limit);
        let result = vector::empty<Profile>();

        let i = 0;
        let len = vector::length(&profile_addresses);
        while (i < len) {
            let addr = *vector::borrow(&profile_addresses, i);
            let profile = get_profile_internal(addr);
            vector::push_back(&mut result, profile);
            i = i + 1;
        };

        result
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