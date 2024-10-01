# Aptos Move Contract Compilation and Deployment Steps

## Setting Up Your Environment
1. **Install Aptos CLI**: Follow the official documentation to install the Aptos CLI.
2. **Create a New Project**: `mkdir hello-contract && cd hello-contract && aptos move init --name hello_contract`

## Writing the Smart Contract
3. **Create Contract Files**: Create `hello_contract.move` and `hello_contract_test.move` in the `sources` directory.

## Compiling the Contract
4. **Compile the Smart Contract**: `aptos move compile --named-addresses hello_contract=default`
5. **Testing the Contract**: `aptos move test --named-addresses hello_contract=default`

## Deploying the Contract
6. **Publish the Smart Contract**: `aptos move publish --named-addresses hello_contract=default`
7. **Verify Deployment**: Check your account address on the Aptos Explorer for your deployed contract.


```

aptos move run --verbose \
  --function-id '<CORRECT_ADDRESS>::heartprotocol::create_profile' \
  --args 'string:John Doe, 30, Software Engineer'


```