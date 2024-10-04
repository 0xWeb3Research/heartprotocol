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
    const ERROR_RECOMMENDATION_ALREADY_EXISTS: u64 = 8;
    const ERROR_ALREADY_LIKED: u64 = 9;
    const ERROR_PROFILE_NOT_FOUND_IN_RECOMMENDATIONS: u64 = 10;
    const ERROR_ALREADY_MATCHED: u64 = 11;
    const ERROR_PROFILE_NOT_FOUND_IN_MATCHES: u64 = 12;
    const ERROR_NOT_ADMIN: u64 = 13;
    const ERROR_PROFILE_NOT_FOUND_IN_LIKES: u64 = 14;


    const ACTIVATION_COST: u64 = 100_000;
    const MATCHMAKER_COST: u64 = 100_000;

    const LIKING_REWARD: u64 = 100_000;
    const LIKING_PLATFORM_FEE: u64 = 100_000;

    const RECOMMENDATION_REWARD: u64 = 100_000;
    const RECOMMENDATION_PLATFORM_FEE: u64 = 100_000;

    // const MATCHMAKER_COST: u64 = 100_000_000;
    // const ACTIVATION_COST: u64 = 100_000_000;

    // EXTRA FEATURES
    // Create a function to get platform fee collected

    struct Recommendation has store, copy, drop {
        recommender: address,
        profile: address,
        match: address,
    }

    struct Like has store, copy, drop {
        profile: address,
    }

    struct Match has store, copy, drop {
        profile: address,
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
        likes: vector<Like>,
        matches: vector<Match>,
    }

    struct ProfileWithAddress has store, copy {
        address: address,
        profile: Profile,
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
            likes: vector::empty<Like>(),
            matches: vector::empty<Match>(),
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

    public fun list_profiles_paginated(start_index: u64, limit: u64): vector<address> acquires ProfileAddresses {
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

    public fun get_profile_internal(user: address): Profile acquires AppState {
        let app_state = borrow_global<AppState>(@heartprotocol);
        assert!(table::contains(&app_state.profiles, user), ERROR_PROFILE_NOT_FOUND);
        *table::borrow(&app_state.profiles, user)
    }

    #[view]
    public fun get_paginated_profile_data(start_index: u64, limit: u64): vector<ProfileWithAddress> acquires AppState, ProfileAddresses {
        let profile_addresses = list_profiles_paginated(start_index, limit);
        let result = vector::empty<ProfileWithAddress>();

        let i = 0;
        let len = vector::length(&profile_addresses);
        while (i < len) {
            let addr = *vector::borrow(&profile_addresses, i);
            let profile = get_profile_internal(addr);
            let profile_with_address = ProfileWithAddress {
                address: addr,
                profile: profile,
            };
            vector::push_back(&mut result, profile_with_address);
            i = i + 1;
        };

        result
    }

    #[view]
    public fun get_profile(user: address): (String, String, String, String, String, String, String, String, String, String, bool, bool, u64, vector<Recommendation>, bool, vector<Like>, vector<Match>) acquires AppState {
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
            profile.likes,
            profile.matches
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

    // when users recommmend a profile 
    // send some coins to the profile, some to platform. 
    // get back double on liking. 
    // gotta check if recommendation already exists
    public fun add_recommendation(account: &signer, recommender: address, match_profile: address) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, recommender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, match_profile), ERROR_PROFILE_NOT_FOUND);

        let matchmaker_profile = table::borrow(&app_state.profiles, sender);
        assert!(matchmaker_profile.matchmaker, ERROR_NOT_A_MATCHMAKER);
        assert!(matchmaker_profile.activated, ERROR_PROFILE_NOT_ACTIVATED);

        let recommender_profile = table::borrow_mut(&mut app_state.profiles, recommender);
        assert!(recommender_profile.is_public, ERROR_PROFILE_NOT_PUBLIC);

        // Check if match_profile is already in the recommender's likes list
        let likes = &recommender_profile.likes;
        let i = 0;
        while (i < vector::length(likes)) {
            let like = vector::borrow(likes, i);
            if (like.profile == match_profile) {
                abort(ERROR_ALREADY_LIKED)
            };
            i = i + 1;
        };

        let recommendation = Recommendation {
            recommender: sender,
            profile: recommender,
            match: match_profile,
        };

        // Add the recommendation to the recommender's list
        vector::push_back(&mut recommender_profile.recommendations, recommendation);

        // Ensure the signer has enough balance
        let balance = coin::balance<AptosCoin>(sender);
        assert!(balance >= RECOMMENDATION_REWARD + RECOMMENDATION_PLATFORM_FEE, NOT_ENOUGH_BALANCE);

        // Transfer RECOMMENDATION_COST to the recommender
        coin::transfer<AptosCoin>(account, recommender, RECOMMENDATION_REWARD);

        // Update the earned field in the recommender's profile
        recommender_profile.earned = recommender_profile.earned + RECOMMENDATION_REWARD;

        // Transfer RECOMMENDATION_PLATFORM_FEE to the platform address
        coin::transfer<AptosCoin>(account, @heartprotocol, RECOMMENDATION_PLATFORM_FEE);
    }

    //
    // create a function like_profile 
    // have to check if you are in liked profile's list if so add to match list
    // when we like a profile do we add our profile to their recommendations list?
    //
    //

    public fun skip_profile(account: &signer, profile: address) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);

        let sender_profile = table::borrow_mut(&mut app_state.profiles, sender);

        // Check if the profile exists in the recommended list and remove it
        let i = 0;
        let recommendations = &mut sender_profile.recommendations;
        let len = vector::length(recommendations);
        while (i < len) {
            let recommendation = vector::borrow(recommendations, i);
            if (recommendation.profile == profile) {
                vector::remove(recommendations, i);
                return
            };
            i = i + 1;
        };

        // If the profile was not found in the recommended list, abort with an error
        abort(ERROR_PROFILE_NOT_FOUND_IN_RECOMMENDATIONS)
    }


    // refactor this function so that recommender is taken from profile (found this out later, as this is a hackthon it's fine ig :) )
    public fun like_profile(account: &signer, profile: address, recommender: address) acquires AppState {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, profile), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, recommender), ERROR_PROFILE_NOT_FOUND);

        // Check if profiles are activated
        assert!(table::borrow(&app_state.profiles, sender).activated, ERROR_PROFILE_NOT_ACTIVATED);
        assert!(table::borrow(&app_state.profiles, profile).activated, ERROR_PROFILE_NOT_ACTIVATED);
        assert!(table::borrow(&app_state.profiles, recommender).activated, ERROR_PROFILE_NOT_ACTIVATED);

        // Check if profile is already in the account's match list
        {
            let sender_profile = table::borrow(&app_state.profiles, sender);
            let i = 0;
            while (i < vector::length(&sender_profile.matches)) {
                let match_profile = vector::borrow(&sender_profile.matches, i);
                if (match_profile.profile == profile) {
                    abort ERROR_ALREADY_MATCHED
                };
                i = i + 1;
            };
        };

        // Check if account is in profile's like list and update accordingly
        let is_match = {
            let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);
            let is_match = false;
            let j = 0;
            while (j < vector::length(&profile_ref.likes)) {
                let like = vector::borrow(&profile_ref.likes, j);
                if (like.profile == sender) {
                    is_match = true;
                    // Remove account from profile's like list
                    vector::remove(&mut profile_ref.likes, j);

                    // Add account to profile's match list
                    let new_match = Match { profile: sender };
                    vector::push_back(&mut profile_ref.matches, new_match);
                    break
                };
                j = j + 1;
            };

            is_match
        };

        // Update sender's profile
        {
            let sender_profile_ref = table::borrow_mut(&mut app_state.profiles, sender);
            if (is_match) {
                // Add profile to account's match list
                let new_match = Match { profile };
                vector::push_back(&mut sender_profile_ref.matches, new_match);

                // Remove profile from account's like list
                let k = 0;
                while (k < vector::length(&sender_profile_ref.likes)) {
                    let like = vector::borrow(&sender_profile_ref.likes, k);
                    if (like.profile == profile) {
                        vector::remove(&mut sender_profile_ref.likes, k);
                        break
                    };
                    k = k + 1;
                };
            } else {
                // Add like to account's profile
                let like = Like { profile };
                vector::push_back(&mut sender_profile_ref.likes, like);
            };

            // Remove from recommendations list
            let l = 0;
            while (l < vector::length(&sender_profile_ref.recommendations)) {
                let recommendation = vector::borrow(&sender_profile_ref.recommendations, l);
                if (recommendation.profile == profile) {
                    vector::remove(&mut sender_profile_ref.recommendations, l);
                    break
                };
                l = l + 1;
            };
        };

        // Update profile's recommendation list
        // recommender: address,
        // profile: address,
        // match: address,
        {
            let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);
            if (!is_match) {
                // Add sender to profile's recommendation list
                let recommendation = Recommendation { profile: profile, recommender: recommender, match: sender };
                vector::push_back(&mut profile_ref.recommendations, recommendation);
            };
        };

        // Send LIKING_REWARD to the recommender
        let balance = coin::balance<AptosCoin>(sender);
        assert!(balance >= LIKING_REWARD + LIKING_PLATFORM_FEE, NOT_ENOUGH_BALANCE);

        coin::transfer<AptosCoin>(account, recommender, LIKING_REWARD);

        // Send LIKING_PLATFORM_FEE to the contract address
        coin::transfer<AptosCoin>(account, @heartprotocol, LIKING_PLATFORM_FEE);

        // Update recommender's profile
        {
            let recommender_ref = table::borrow_mut(&mut app_state.profiles, recommender);
            // Add LIKING_REWARD to the earned field in the recommender's profile
            recommender_ref.earned = recommender_ref.earned + LIKING_REWARD;
        };

    }

    public fun admin_remove_from_like_list(account: &signer, profile: address, target: address) acquires AppState {
        let admin_address = @heartprotocol;
        let caller_address = signer::address_of(account);

        // Ensure the caller is the contract address
        assert!(caller_address == admin_address, ERROR_NOT_ADMIN);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, profile), ERROR_PROFILE_NOT_FOUND);

        let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);

        // Remove target from profile's like list
        let i = 0;
        while (i < vector::length(&profile_ref.likes)) {
            let like = vector::borrow(&profile_ref.likes, i);
            if (like.profile == target) {
                vector::remove(&mut profile_ref.likes, i);
                return
            };
            i = i + 1;  
        };

        // If the target was not found in the like list, abort with an error
        abort ERROR_PROFILE_NOT_FOUND_IN_LIKES
    }

    entry fun admin_remove_from_recommended_list(account: &signer, profile: address, target: address) acquires AppState {
        let admin_address = @heartprotocol;
        let caller_address = signer::address_of(account);

        // Ensure the caller is the contract address
        assert!(caller_address == admin_address, ERROR_NOT_ADMIN);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, profile), ERROR_PROFILE_NOT_FOUND);

        let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);

        // Remove target from profile's recommended list
        let i = 0;
        while (i < vector::length(&profile_ref.recommendations)) {
            let recommendation = vector::borrow(&profile_ref.recommendations, i);
            if (recommendation.profile == target) {
                vector::remove(&mut profile_ref.recommendations, i);
                return
            };
            i = i + 1;  
        };

        // If the target was not found in the recommended list, abort with an error
        abort ERROR_PROFILE_NOT_FOUND_IN_RECOMMENDATIONS
    }

    entry fun admin_remove_from_match_list(account: &signer, profile: address, target: address) acquires AppState {
        let admin_address = @heartprotocol;
        let caller_address = signer::address_of(account);

        // Ensure the caller is the contract address
        assert!(caller_address == admin_address, ERROR_NOT_ADMIN);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, profile), ERROR_PROFILE_NOT_FOUND);

        let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);

        // Remove target from profile's match list
        let i = 0;
        while (i < vector::length(&profile_ref.matches)) {
            let match = vector::borrow(&profile_ref.matches, i);
            if (match.profile == target) {
                vector::remove(&mut profile_ref.matches, i);
                return
            };
            i = i + 1;  
        };

        // If the target was not found in the match list, abort with an error
        abort ERROR_PROFILE_NOT_FOUND_IN_MATCHES
    }


}