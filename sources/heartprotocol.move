module heartprotocol::core {
    use std::string::String;
    use aptos_std::table::{Self, Table};
    use std::signer;
    use aptos_framework::coin::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::vector;
    use aptos_std::hash;
    use aptos_framework::account;
    use std::debug;
    // use std::option::{Option};
    

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
    const ERROR_CANNOT_SUGGEST_SAME_ACCOUNT: u64 = 15;
    const ERROR_CANNOT_SUGGEST_OWN_ACCOUNT: u64 = 16;
    const ERROR_NOT_MATCHED: u64 = 17;
    const ERROR_APP_STATE_NOT_INITIALIZED: u64 = 18;
    const ERROR_PROFILE_ADDRESSES_NOT_INITIALIZED: u64 = 19;
    const YOU_HAVE_ALREADY_LIKED_THIS_PROFILE: u64 = 20;


    const ACTIVATION_COST: u64 = 100_000;
    const MATCHMAKER_COST: u64 = 100_000;

    const LIKING_BASE_REWARD: u64 = 100_000;
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
        amount: u64,
    }

    struct Like has store, copy, drop {
        profile: address,
    }

    struct Match has store, copy, drop {
        profile: address,
    }

    struct MatchedAddresses has store, key, drop {
        matches: vector<vector<u8>>, 
    }

    struct Profile has store, copy, drop {
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
        reward: u64,
        photo_one: String,
        photo_two: String,
        photo_three: String,
        weight: String,
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

  public fun initialize(account: &signer) {
    let sender = signer::address_of(account);
    debug::print(&sender);
    
    if (!exists<AppState>(@heartprotocol)) {
        debug::print(&b"Initializing AppState");
        move_to(account, AppState {
            profiles: table::new(),
        });
        move_to(account, ProfileAddresses {
            addresses: vector::empty<address>(),
        });
        move_to(account, MatchedAddresses {
            matches: vector::empty<vector<u8>>(),
        });
    } else {
        debug::print(&b"AppState already exists");
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
        reward: u64,
        photo_one: String,
        photo_two: String,
        photo_three: String,
        weight: String,
    ) acquires AppState, ProfileAddresses {
        let sender = signer::address_of(account);

        // Explicitly initialize if AppState doesn't exist
        if (!exists<AppState>(@heartprotocol)) {
            initialize(account);
        };

        assert!(exists<AppState>(@heartprotocol), ERROR_APP_STATE_NOT_INITIALIZED);
        assert!(exists<ProfileAddresses>(@heartprotocol), ERROR_PROFILE_ADDRESSES_NOT_INITIALIZED);

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
            recommendations: vector::empty<Recommendation>(),
            is_public: false,
            likes: vector::empty<Like>(),
            matches: vector::empty<Match>(),
            reward,
            photo_one,
            photo_two,
            photo_three,
            weight,
        };

        table::add(&mut app_state.profiles, sender, profile);
        let profile_addresses = borrow_global_mut<ProfileAddresses>(@heartprotocol);
        vector::push_back(&mut profile_addresses.addresses, sender);
    }

    public fun compare_and_hash_addresses(addr1: address, addr2: address): vector<u8> {
        let combined = vector::empty<u8>();
        vector::append(&mut combined, account::get_authentication_key(addr1));
        vector::append(&mut combined, account::get_authentication_key(addr2));

        // Sort the combined bytes
        sort_bytes(&mut combined);

        // Count occurrences and create result
        let result = count_and_format(&combined);

        // Hash the result
        hash::sha3_256(result)
    }

    // Helper function to sort bytes
    fun sort_bytes(v: &mut vector<u8>) {
        let len = vector::length(v);
        let i = 0;
        while (i < len) {
            let j = i + 1;
            while (j < len) {
                if (*vector::borrow(v, i) > *vector::borrow(v, j)) {
                    vector::swap(v, i, j);
                };
                j = j + 1;
            };
            i = i + 1;
        };
    }

    fun count_and_format(v: &vector<u8>): vector<u8> {
        let result = vector::empty<u8>();
        let i = 0;
        let len = vector::length(v);

        while (i < len) {
            let char = *vector::borrow(v, i);
            let count = 1;
            let j = i + 1;
            while (j < len && *vector::borrow(v, j) == char) {
                count = count + 1;
                j = j + 1;
            };
            vector::push_back(&mut result, char);
            vector::push_back(&mut result, (count as u8));
            i = j;
        };

        result
    }

    public fun add_or_check_matched_pair(addr1: address, addr2: address) acquires MatchedAddresses {
        let hash = compare_and_hash_addresses(addr1, addr2);
        
        let matched_addresses = borrow_global_mut<MatchedAddresses>(@heartprotocol);
        
        // Only add the hash if it doesn't already exist
        // This ensures that (x,y) and (y,x) are treated as the same pair
        if (!vector::contains(&matched_addresses.matches, &hash)) {
            vector::push_back(&mut matched_addresses.matches, hash);
        }
    }

    #[view]
    public fun are_addresses_matched(addr1: address, addr2: address): bool acquires MatchedAddresses {
        if (!exists<MatchedAddresses>(@heartprotocol)) {
            return false
        };

        let matched_addresses = borrow_global<MatchedAddresses>(@heartprotocol);
        let hash = compare_and_hash_addresses(addr1, addr2);

       if (vector::contains(&matched_addresses.matches, &hash)) {
            return true
        } else {
            return false
        }
    }

    public fun remove_hash(addr1: address, addr2: address) acquires MatchedAddresses {
        let hash = compare_and_hash_addresses(addr1, addr2);
        let matched_addresses = borrow_global_mut<MatchedAddresses>(@heartprotocol);
        
        let (found, index) = vector::index_of(&matched_addresses.matches, &hash);
        if (found) {
            vector::remove(&mut matched_addresses.matches, index);
        };
    }

    #[view]
    public fun get_total_profiles(): u64 acquires ProfileAddresses {
        assert!(exists<ProfileAddresses>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let profile_addresses = borrow_global<ProfileAddresses>(@heartprotocol);
        vector::length(&profile_addresses.addresses)
    }

    // given an array of index I want the profiles at those indexes

    #[view]
    public fun get_profiles_at_indexes(indexes: vector<u64>): vector<ProfileWithAddress> acquires AppState, ProfileAddresses {
        let profile_addresses = borrow_global<ProfileAddresses>(@heartprotocol);
        let result = vector::empty<ProfileWithAddress>();

        let i = 0;
        let len = vector::length(&indexes);
        while (i < len) {
            let index = *vector::borrow(&indexes, i);
            let addr = *vector::borrow(&profile_addresses.addresses, index);
            let profile = get_profile_internal(addr);

            // Check if the profile is activated and is_public
            if (profile.activated && profile.is_public) {
                let profile_with_address = ProfileWithAddress {
                    address: addr,
                    profile: profile,
                };
                vector::push_back(&mut result, profile_with_address);
            };

            i = i + 1;
        };

        result
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
    public fun get_profile(user: address): (String, String, String, String, String, String, String, String, String, String, bool, bool, u64, vector<Recommendation>, bool, vector<Like>, vector<Match>, u64, String, String, String, String) acquires AppState {
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
            profile.matches,
            profile.reward,
            profile.photo_one,
            profile.photo_two,
            profile.photo_three,
            profile.weight,
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
        reward: u64,
        photo_one: String,
        photo_two: String,
        photo_three: String,
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
        profile.reward = reward;
        profile.photo_one = photo_one;
        profile.photo_two = photo_two;
        profile.photo_three = photo_three;
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
    // recommender is the one who is being recommended
    entry public fun add_recommendation(account: &signer, recommender: address, match_profile: address) acquires AppState {
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

        // Ensure the recommender is not the same as the match_profile
        assert!(recommender != match_profile, ERROR_CANNOT_SUGGEST_SAME_ACCOUNT);

        // Ensure the sender is not the same as the recommender or the match_profile
        assert!(sender != recommender, ERROR_CANNOT_SUGGEST_OWN_ACCOUNT);
        assert!(sender != match_profile, ERROR_CANNOT_SUGGEST_OWN_ACCOUNT);

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

        let profile_reward = recommender_profile.reward;

        let recommendation = Recommendation {
            recommender: sender,
            profile: recommender,
            match: match_profile,
            amount: profile_reward 
        };

        // Add the recommendation to the recommender's list
        vector::push_back(&mut recommender_profile.recommendations, recommendation);

        let balance = coin::balance<AptosCoin>(sender);

        // This is the base reward :)

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

    entry public fun skip_profile(account: &signer, profile: address) acquires AppState {
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
            if (recommendation.match == profile) {
                vector::remove(recommendations, i);
                return
            };
            i = i + 1;
        };

        // If the profile was not found in the recommended list, abort with an error
        abort(ERROR_PROFILE_NOT_FOUND_IN_RECOMMENDATIONS)
    }


    // refactor this function so that recommender is taken from profile (found this out later, as this is a hackthon it's fine ig :) )
    // when I like
    // if account not in profile's like list, add to recommendations list, with recommender as recommender
    //

    entry public fun like_profile(account: &signer, profile: address, recommender: address) acquires AppState, MatchedAddresses {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        if (!exists<MatchedAddresses>(@heartprotocol)) {
            move_to(account, MatchedAddresses {
                matches: vector::empty<vector<u8>>(),
            });
        };
        
        assert!(exists<MatchedAddresses>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

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

        
        // Check if already in liked list
        {
            let sender_profile = table::borrow(&app_state.profiles, sender);
            let i = 0;
            while (i < vector::length(&sender_profile.likes)) {
                let like = vector::borrow(&sender_profile.likes, i);
                if (like.profile == profile) {
                    abort YOU_HAVE_ALREADY_LIKED_THIS_PROFILE
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
        // recommender is the who is getting recommedation
        {
            if (!is_match) {
            let profile_ref = table::borrow_mut(&mut app_state.profiles, profile);
            let profile_reward = profile_ref.reward;

                // Add sender to profile's recommendation list
                let recommendation = Recommendation { profile: profile, recommender: recommender, match: sender, amount: profile_reward};
                vector::push_back(&mut profile_ref.recommendations, recommendation);
            };
        };

        // RETHINK THE LOGIC BEHIND THIS (MAYBE MAKE IT MORE SECURE)
        // HAVE THE AMOUNT IN RECOMMENDATION

        // Get the recommnder with account: &signer, profile: address, recommender: address these values and get amount from the recommenation struct

        let profile_ref = table::borrow_mut(&mut app_state.profiles, sender);
        let recommendation_amount = 0;

        // Iterate through the recommendations to find the matching one
        let i = 0;
        let len = vector::length(&profile_ref.recommendations);
        while (i < len) {
            let recommendation = vector::borrow(&profile_ref.recommendations, i);
            if (recommendation.profile == profile && recommendation.recommender == recommender && recommendation.match == sender) {
                recommendation_amount = recommendation.amount;
                break
            };

            i = i + 1;
        };

        let liking_reward = recommendation_amount;

        // Send LIKING_REWARD to the recommender
        let balance = coin::balance<AptosCoin>(sender);
        assert!(balance >= liking_reward + LIKING_PLATFORM_FEE, NOT_ENOUGH_BALANCE);

        coin::transfer<AptosCoin>(account, recommender, liking_reward);

        // Send LIKING_PLATFORM_FEE to the contract address
        coin::transfer<AptosCoin>(account, @heartprotocol, LIKING_PLATFORM_FEE);

        // Update recommender's profile
        {
            let recommender_ref = table::borrow_mut(&mut app_state.profiles, recommender);
            // Add LIKING_REWARD to the earned field in the recommender's profile
            recommender_ref.earned = recommender_ref.earned + liking_reward;
        };

        skip_profile(account, profile);
        add_or_check_matched_pair(sender, profile);
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
    
    #[view]
    public fun get_contract_balance(): u64 {
        coin::balance<AptosCoin>(@heartprotocol)
    }

    
    entry public fun unmatch(account: &signer, profile_to_unmatch: address) acquires AppState, MatchedAddresses {
        let sender = signer::address_of(account);

        assert!(exists<AppState>(@heartprotocol), ERROR_PROFILE_NOT_FOUND);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, profile_to_unmatch), ERROR_PROFILE_NOT_FOUND);

        // Check if the profiles are matched before proceeding
        assert!(are_addresses_matched(sender, profile_to_unmatch), ERROR_NOT_MATCHED);

        // Remove profile_to_unmatch from sender's match list
        {
            let sender_profile = table::borrow_mut(&mut app_state.profiles, sender);
            let (found, index) = vector::index_of(&sender_profile.matches, &Match { profile: profile_to_unmatch });
            assert!(found, ERROR_NOT_MATCHED);
            vector::remove(&mut sender_profile.matches, index);
        };

        // Remove sender from profile_to_unmatch's match list
        {
            let profile_ref = table::borrow_mut(&mut app_state.profiles, profile_to_unmatch);
            let (found, index) = vector::index_of(&profile_ref.matches, &Match { profile: sender });
            assert!(found, ERROR_NOT_MATCHED);
            vector::remove(&mut profile_ref.matches, index);
        };

        remove_hash(sender, profile_to_unmatch);
    }
}
