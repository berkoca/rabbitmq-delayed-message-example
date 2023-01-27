FROM rabbitmq:3.11.1-management

RUN apt-get update

RUN apt-get install -y curl

RUN curl -L https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/3.11.1/rabbitmq_delayed_message_exchange-3.11.1.ez > $RABBITMQ_HOME/plugins/rabbitmq_delayed_message_exchange-3.11.1.ez

RUN chown rabbitmq:rabbitmq $RABBITMQ_HOME/plugins/rabbitmq_delayed_message_exchange-3.11.1.ez

RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange