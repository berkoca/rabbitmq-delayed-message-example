# Using RabbitMQ with Delayed Message Exchange Plugin
---

## Creating & Running RabbitMQ Docker Container with Plugin
Use below codes by order in terminal inside project folder using Dockerfile
**`docker build -t <preferred_image_tag> .`**
**`docker run -d -p 15672:15672 -p 5672:5672 <preferred_image_tag>`**

## Running Code

### Setting Environment Variables
First, change **.env-example** file's name to **.env**

#### Variables
    - AMQP_URL
    - EXCHANGE_NAME
    - QUEUE_NAME
    - ROUTING_KEY
    - PORT

### Installing npm Packages
**`npm i`** or **`yarn i`**

### Compiling TypeScript Code to Executable JavaScript Code
**`tsc`**

### Running Code
**`node index.js`**

## Publishing Message
You must send HTTP POST request to **http://localhost:port/**. Request body will transform to message data. For spesifying delay time, you should send delay param with request URL.
> Example: http://localhost:3000?delay=5000