## API Endpoint Specification

### `/node/get-all-nodes`

-   Purpose: Returns detailed information we have gathered for each stock node
-   Request Format: No request parameters or body.
-   Response Format:
    ```
        [
          {
            data:
            [
              {
                public_key: string - The public key of the node,
                ip: string - The IP address; can be NULL,
                rippled_version: string,
                uptime: number - The number of seconds the node has been runnning
                portRunningOn: number - The port on which rippled is running(usually 51235),
                ports: string - A list of open ports separated by commas, e.g "88,3000,51235"; can be null or empty string,
                services: string - A list of services running on the open ports in order separated by commas, e.g "HTTP, bitcoin, rippled"; can be null or empty string,
                publishers: [string,...] - A list of the node's publishers
                longtitude: number,
                latitude: number,
                timestamp: Date in ISO format - The last time the node was detected by the crawler
              },
              {
                ...
              },
              ...
            ]
          }
        ]
    ```

### `/node/get-all-nodes-with-score`

-   Purpose: Returns basic information we have gathered for each stock node, as well as the most recent security score.
-   Request Format: No request parameters or body.
-   Response Format:
    ```
      [
        {
          data:
          [
            {
              public_key: string - The public key of the node,
              rippled_version: string,
              uptime: number - The number of seconds the node has been runnning
              longtitude: number,
              latitude: number,
              score: number - The most recent security score,
              timestamp: Date in ISO format - when was the last security score calculated
            },
            {
              ...
            },
            ...
          ]
        }
      ]
    ```

### `/node/peers`

-   Purpose: Returns the public_key and security score of all stock node peers of the node specified by the request parameter.
-   Request Format:
    -   Request parameter `public_key` - the public key of the node, who's peers are needed.
-   Response Format:
    ```
        [
            {
                data: {
                        public_key: string - The public key of the peer,
                        metric_version: string - The version of the security metric (useful for future updates)
                        score: number - The most recent security score of the peer,
                        timestamp: Date in ISO format - The time when the security score was calculated
                      },
                      {
                        ...
                      },
                      ...
            }
        ]
    ```

### `/node/info`

-   Purpose: Returns the information, as well as the daily average security score for the past 30 days, about a single stock node, specified by the request parameter.
-   Request format
    -   Request parameter `public_key` - the public key of the node.
-   Response Format
    ```
        [
          {
            data:
              {
                public_key: string - The public key of the node,
                ip: string - The IP address; can be NULL,
                rippled_version: string,
                uptime: number - The number of seconds the node has been runnning
                portRunningOn: number - The port on which rippled is running(usually 51235),
                ports: string - A list of open ports separated by commas, e.g "88,3000,51235"; can be null or empty string,
                services: string - A list of services running on the open ports in order separated by commas, e.g "HTTP, bitcoin, rippled"; can be null or empty string,
                publishers: [string,...] - A list of the node's publishers
                longtitude: number,
                latitude: number,
                history: Array containing the average security score of the node for each day for the past 30 days
                [
                  {
                    public_key: string - The public key of the node,
                    date: Date in ISO format - The day 
                    average_score: number - The average score for this day
                  },
                  {
                    ...
                  },
                  ...
                ]
              }
          }
        ]
    ```

### `/node/history`

-   Purpose: Returns the average security score of a node for each day for the past 30 days.
-   Request Format
    -   Request parameter `public_key` - the public key of the node.
    -   Request parameter `duration` - the number of days in the past for which to get the information.
-   Response Format
  ```
    [
      data:{
        [
          {
            public_key: string - The public key of the node,
            date: Date in ISO format - The day 
            average_score: number - The average score for this day
          },
          {
            ...
          },
          ...
        ]
      }
    ]
  ```

### `/validator/get-all-validators`

-   Purpose: Returns basic information about all validators, as well as its most recent trust score and a history of daily average trust scores over the last 30 days.
-   Request Format: No request parameters or body.
-   Response: 
  ```
      [
        {
          data:
          [
            {
              public_key: string - The public key of the validator,
              score: The most recent trust score
              timestamp: Date in ISO format - The time when the most recent trust score was calculated,
              history: [
                {
                  timestamp: Date in ISO format - the date at which the trust score was calculated
                  score: number - the trust score
                },
                {
                  ...
                },
                ...
              ]
            },
            {
              ...
            },
            ...
          ]
        }
      ]
  ```

### `/validator/history`

-   Purpose: Returns all trust score calculations of a validator for the past 30 days. 
-   Request Format: 
    -   Request parameter `public_key` - the public key of the node.
    -   Request parameter `duration` - the number of days in the past for which to get the information.
-   Response: 
  ```
  [
    {
      data: 
      {
        history: 
        [
          {
            timestamp: Date in ISO format - the date at which the trust score was calculated
            score: number - the trust score
          },
          {
            ...
          },
          ...
        ]
      }
    }
  ]  
  ```

### `/validator/history-score`

-   Purpose: Returns an average daily trust score of a validator for the past 30 days. 
-   Request Format: 
    -   Request parameter `public_key` - the public key of the node.
    -   Request parameter `duration` - the number of days in the past for which to get the information.
-   Response: 
  ```
  [
    {
      data: 
      {
        history: 
        [
          {
            timestamp: Date in ISO format - the date at which the trust score was calculated
            score: number - the trust score
          },
          {
            ...
          },
          ...
        ]
      }
    }
  ]  
  ```