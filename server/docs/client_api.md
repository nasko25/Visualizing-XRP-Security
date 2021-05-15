## API Endpoints

### `/node/get-all-nodes`

- Purpose: Client wants to get the geo-locations of all nodes and basic data about them
- Request Format: No request parameters or body.
- Response Format: 
    ```
        [
            {
                longtitude: "...",
                latitude: "...",
                data: {
                        public_key: "...",
                        ip: "..."
                      }
            },
            {
            ...
            },
            ...
            
        ]
    ```


### `/node/peers`

- Purpose: The client wants to display the connections to the peers of a node.
- Request Format: 
  - Request parameter `public_key` - the public key of the node by which to find the connections in the database.
- Response Format: 
  - TODO

### `/node/score`

- Purpose: The client wants to display the security score of a node for the past 30 days.
- Request Format:
    - Request parameter `public_key` - the public key of the node.
- Response Format
  - TODO

### `/node/score-peers`

- Purpose: The client wants both the peers of a node and its security metric historical information.
- Request Format:
  - Request parameter `public_key` - the public key of the node.
- Response Format
  - TODO

### `/node/history`

- Purpose: The client wants to display the security score of a node for the past 30 days or more.
- Request Format
  - Request parameter `public_key` - the public key of the node.
  - Request parameter `duration`   - the number of days in the past for which to get the information.
- Response Format
  - TODO