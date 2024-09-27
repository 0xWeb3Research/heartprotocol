module heartprotocol::core {
    use std::string::String;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::table::{Self, Table};
    use aptos_framework::timestamp;
    use std::signer;

    // Constants
    const STAKE_AMOUNT: u64 = 5000000; // 5 APT in octas
    const MATCHMAKER_FEE: u64 = 2500000; // 50% of stake
    const PLATFORM_FEE: u64 = 1000000; // 20% of stake
    const MATCHER_FEE: u64 = 750000; // 15% of stake for each matcher
    const MATCHMAKER_STAKE: u64 = 10000000; // 10 APT in octas
    const DEFAULT_MAX_QUEUE_SIZE: u64 = 24;
    const INCREASED_MAX_QUEUE_SIZE: u64 = 48;
    const QUEUE_INCREASE_STAKE: u64 = 14000000; // 14 APT in octas
    const SECONDS_PER_DAY: u64 = 86400;

    // Errors
    const ERROR_INSUFFICIENT_BALANCE: u64 = 1;
    const ERROR_PROFILE_ALREADY_EXISTS: u64 = 2;
    const ERROR_PROFILE_NOT_FOUND: u64 = 3;
    const ERROR_NOT_MATCHMAKER: u64 = 4;
    const ERROR_QUEUE_FULL: u64 = 5;
    const ERROR_INSUFFICIENT_MATCHMAKER_STAKE: u64 = 6;
    const ERROR_INSUFFICIENT_STAKE_FOR_DISTRIBUTION: u64 = 7;
    const ERROR_NOT_AUTHORIZED: u64 = 8;
    const ERROR_DAILY_LIMIT_REACHED: u64 = 9;

    struct Profile has key, store {
        name: String,
        bio: String,
        about_me: String,
        interests: vector<String>,
        image: vector<u8>,
        location: String,
        height: u64,
        gender: String,
        work: String,
        relationship_type: String,
        stake: Coin<AptosCoin>,
        increased_queue: bool,
        last_reset_time: u64,
        daily_swipes: u64,
    }

    struct UserQueue has key, store {
        profiles: vector<address>,
    }

    struct MatchmakerState has key {
        is_matchmaker: bool,
        stake: Coin<AptosCoin>,
    }

    struct AppState has key {
        profiles: Table<address, Profile>,
        queues: Table<address, UserQueue>,
        matchmakers: vector<address>,
        platform_fees: Coin<AptosCoin>,
    }

    // Initialize the app state
    public fun initialize(account: &signer) {
        move_to(account, AppState {
            profiles: table::new(),
            queues: table::new(),
            matchmakers: vector::empty(),
            platform_fees: coin::zero<AptosCoin>(),
        });
    }

    // User functions

    public entry fun create_profile(
        name: String,
        account: &signer,
        bio: String,
        about_me: String,
        interests: vector<String>,
        image: vector<u8>,
        location: String,
        height: u64,
        gender: String,
        work: String,
        relationship_type: String,
    ) acquires AppState {
        let sender = signer::address_of(account);
        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(!table::contains(&app_state.profiles, sender), ERROR_PROFILE_ALREADY_EXISTS);
        assert!(coin::balance<AptosCoin>(sender) >= STAKE_AMOUNT, ERROR_INSUFFICIENT_BALANCE);

        let stake = coin::withdraw<AptosCoin>(account, STAKE_AMOUNT);

        let profile = Profile {
            name,
            bio,
            about_me,
            interests,
            image,
            location,
            height,
            gender,
            work,
            relationship_type,
            stake,
            increased_queue: false,
            last_reset_time: timestamp::now_seconds(),
            daily_swipes: 0,
        };

        table::add(&mut app_state.profiles, sender, profile);
    }

    public entry fun increase_queue_size(account: &signer) acquires AppState {
        let sender = signer::address_of(account);
        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(coin::balance<AptosCoin>(sender) >= QUEUE_INCREASE_STAKE, ERROR_INSUFFICIENT_BALANCE);

        let profile = table::borrow_mut(&mut app_state.profiles, sender);
        assert!(!profile.increased_queue, ERROR_QUEUE_FULL);

        let stake = coin::withdraw<AptosCoin>(account, QUEUE_INCREASE_STAKE);
        coin::merge(&mut profile.stake, stake);
        profile.increased_queue = true;
    }

    // Matchmaker functions

    public entry fun become_matchmaker(account: &signer) acquires AppState {
        let sender = signer::address_of(account);
        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(coin::balance<AptosCoin>(sender) >= MATCHMAKER_STAKE, ERROR_INSUFFICIENT_MATCHMAKER_STAKE);

        let stake = coin::withdraw<AptosCoin>(account, MATCHMAKER_STAKE);

        vector::push_back(&mut app_state.matchmakers, sender);
        move_to(account, MatchmakerState { is_matchmaker: true, stake });
    }

    public entry fun suggest_profiles(
        matchmaker: &signer,
        user: address,
        suggested_profiles: vector<address>
    ) acquires AppState, MatchmakerState {
        let sender = signer::address_of(matchmaker);
        let matchmaker_state = borrow_global<MatchmakerState>(sender);
        assert!(matchmaker_state.is_matchmaker, ERROR_NOT_MATCHMAKER);

        let app_state = borrow_global_mut<AppState>(@heartprotocol);
        
        if (!table::contains(&app_state.queues, user)) {
            table::add(&mut app_state.queues, user, UserQueue { profiles: vector::empty() });
        };

        let user_queue = table::borrow_mut(&mut app_state.queues, user);
        let user_profile = table::borrow(&app_state.profiles, user);
        let max_queue_size = if (user_profile.increased_queue) { INCREASED_MAX_QUEUE_SIZE } else { DEFAULT_MAX_QUEUE_SIZE };
        
        let i = 0;
        while (i < vector::length(&suggested_profiles)) {
            let profile = *vector::borrow(&suggested_profiles, i);
            if (!vector::contains(&user_queue.profiles, &profile) && vector::length(&user_queue.profiles) < max_queue_size) {
                vector::push_back(&mut user_queue.profiles, profile);
            };
            i = i + 1;
        };

        assert!(vector::length(&user_queue.profiles) <= max_queue_size, ERROR_QUEUE_FULL);
    }

    // User interaction functions

public entry fun swipe_right(account: &signer, liked_profile: address) acquires AppState {
    let sender = signer::address_of(account);
    let is_match = false;  // Declare is_match outside the scope
    {
        let app_state = borrow_global_mut<AppState>(@heartprotocol);

        assert!(table::contains(&app_state.profiles, sender), ERROR_PROFILE_NOT_FOUND);
        assert!(table::contains(&app_state.profiles, liked_profile), ERROR_PROFILE_NOT_FOUND);

        // Update daily swipes
        {
            let profile = table::borrow_mut(&mut app_state.profiles, sender);
            let current_time = timestamp::now_seconds();
            
            if (current_time - profile.last_reset_time >= SECONDS_PER_DAY) {
                profile.last_reset_time = current_time;
                profile.daily_swipes = 0;
            };

            let max_daily_swipes = if (profile.increased_queue) { INCREASED_MAX_QUEUE_SIZE } else { DEFAULT_MAX_QUEUE_SIZE };
            assert!(profile.daily_swipes < max_daily_swipes, ERROR_DAILY_LIMIT_REACHED);

            profile.daily_swipes = profile.daily_swipes + 1;
        };

        // Add the current user to the liked profile's queue
        if (!table::contains(&app_state.queues, liked_profile)) {
            table::add(&mut app_state.queues, liked_profile, UserQueue { profiles: vector::empty() });
        };
        {
            let liked_queue = table::borrow_mut(&mut app_state.queues, liked_profile);
            if (!vector::contains(&liked_queue.profiles, &sender)) {
                vector::push_back(&mut liked_queue.profiles, sender);
            };
        };

        // Check if it's a match
        if (table::contains(&app_state.queues, sender)) {
            let user_queue = table::borrow(&app_state.queues, sender);
            is_match = vector::contains(&user_queue.profiles, &liked_profile);  // Update is_match here
        };

        if (is_match) {
            // Remove profiles from queues
            {
                let user_queue = table::borrow_mut(&mut app_state.queues, sender);
                let (found, index) = vector::index_of(&user_queue.profiles, &liked_profile);
                if (found) {
                    vector::remove(&mut user_queue.profiles, index);
                };
            };
            {
                let liked_queue = table::borrow_mut(&mut app_state.queues, liked_profile);
                let (found, index) = vector::index_of(&liked_queue.profiles, &sender);
                if (found) {
                    vector::remove(&mut liked_queue.profiles, index);
                };
            };
        };
    };

    // If it's a match, distribute the stake outside the previous borrow scope
    if (is_match) {
        distribute_stake(sender, liked_profile);
    };
}

    // Helper functions

      fun distribute_stake(user1: address, user2: address) acquires AppState {
        let app_state = borrow_global_mut<AppState>(@heartprotocol);
        
        let matchmakers_length = vector::length(&app_state.matchmakers);
        assert!(matchmakers_length > 0, ERROR_NOT_MATCHMAKER);
        
        let matchmaker_index = (timestamp::now_microseconds() as u64) % matchmakers_length;
        let matchmaker = *vector::borrow(&app_state.matchmakers, matchmaker_index);

        // Handle profile1
        {
            let profile1 = table::borrow_mut(&mut app_state.profiles, user1);
            assert!(coin::value(&profile1.stake) >= STAKE_AMOUNT, ERROR_INSUFFICIENT_STAKE_FOR_DISTRIBUTION);

            let matchmaker_fee1 = coin::extract(&mut profile1.stake, MATCHMAKER_FEE);
            coin::deposit(matchmaker, matchmaker_fee1);
            
            coin::merge(&mut app_state.platform_fees, coin::extract(&mut profile1.stake, PLATFORM_FEE));
            
            let matcher_fee1 = coin::extract(&mut profile1.stake, MATCHER_FEE);
            coin::deposit(user2, matcher_fee1);
            
            let matcher_fee2 = coin::extract(&mut profile1.stake, MATCHER_FEE);
            coin::deposit(user1, matcher_fee2);
        };

        // Handle profile2
        {
            let profile2 = table::borrow_mut(&mut app_state.profiles, user2);
            assert!(coin::value(&profile2.stake) >= STAKE_AMOUNT, ERROR_INSUFFICIENT_STAKE_FOR_DISTRIBUTION);

            let matchmaker_fee2 = coin::extract(&mut profile2.stake, MATCHMAKER_FEE);
            coin::deposit(matchmaker, matchmaker_fee2);
            
            coin::merge(&mut app_state.platform_fees, coin::extract(&mut profile2.stake, PLATFORM_FEE));
            
            let matcher_fee3 = coin::extract(&mut profile2.stake, MATCHER_FEE);
            coin::deposit(user1, matcher_fee3);
            
            let matcher_fee4 = coin::extract(&mut profile2.stake, MATCHER_FEE);
            coin::deposit(user2, matcher_fee4);
        };
    }
    // Platform fee withdrawal
    public entry fun withdraw_platform_fees(admin: &signer) acquires AppState {
        assert!(signer::address_of(admin) == @heartprotocol, ERROR_NOT_AUTHORIZED);
        
        let app_state = borrow_global_mut<AppState>(@heartprotocol);
        let fees = coin::extract_all(&mut app_state.platform_fees);
        coin::deposit(signer::address_of(admin), fees);
    }
}