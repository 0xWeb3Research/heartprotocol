
<p align="center">
<img src="https://github.com/user-attachments/assets/69b9ddac-2a83-475d-a265-182ab83e6276" alt="Heart Protocol" style="width: 25%; text-align: center;"/>
</div>

## Heart Protocol

Protocol for profile creation, staking-based participation, community matchmaking, and reward distribution on Aptos Move.

Note: APT amounts are lowered for alpha/testnet and adjustable in-contract.

![Heart Protocol (7)](https://github.com/user-attachments/assets/e9e77063-2e90-4e24-a312-0fd2c6a22fd1)

## Features


- Decentralized profile ownership
- Staking-gated participation and roles
- Community-submitted match suggestions
- Private messaging entry via mutual match
- Reward distribution for successful matchmaking
- Passive rewards via profile engagement

## Flow

1. Create profile
2. Stake APT to activate
3. Optional: stake for matchmaker role
4. Submit match suggestions (sybil resisitent)
5. Users like; mutual like creates a match
6. Rewards distributed on successful matches

## Setup

1. Clone
   ```
   git clone https://github.com/yourusername/heart-protocol.git
   ```
2. Compile
   ```
   cd heart-protocol
   aptos move compile
   ```
3. Publish
   ```
   aptos move publish
   ```
4. Example run
   ```
   aptos move run --function-id 'your_address::core::create_profile' --args 'string:Your Name' 'string:Your Bio'
   ```

## Contributing

See `CONTRIBUTING.md`.

## Legal

No warranty. Use at your own risk.

Author: sidharth.co
