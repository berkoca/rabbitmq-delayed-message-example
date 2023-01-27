import amqp from "amqplib/callback_api";
import * as uuid from "uuid";

class AMQP {
  private amqp_url;
  private queue_url;
  private exchange_name;
  private routing_key;

  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  constructor(
    amqp_url: string = "amqp://localhost",
    queue_url: string = "default-queue",
    exchange_name: string = "default-delayed-exchange",
    routing_key: string = "default-routing-key"
  ) {
    this.amqp_url = amqp_url;
    this.queue_url = queue_url;
    this.exchange_name = exchange_name;
    this.routing_key = routing_key;
  }

  public start(onConsume: Function) {
    const self = this;

    amqp.connect(this.amqp_url, function (error, newConnection) {
      if (error) {
        console.error("[AMQP]", error.message);
        return setTimeout(self.start, 1000);
      }

      newConnection.on("error", function (error) {
        if (error.message !== "Connection closing") {
          console.error("[AMQP] conn error", error.message);
        }
      });

      newConnection.on("close", function () {
        console.error("[AMQP] reconnecting");
        return setTimeout(self.start, 1000);
      });

      console.log("[AMQP] connected");
      self.connection = newConnection;

      self.startPublisher();
      self.startConsumer(onConsume);
    });
  }

  public publish(content: string, delay: string | number) {
    try {
      this.channel!.publish(
        this.exchange_name,
        this.routing_key,
        Buffer.from(content),
        { headers: { "x-delay": delay }, messageId: uuid.v4() }
      );
    } catch (error: any) {
      console.error("[AMQP] failed", error.message);
    }
  }

  private startPublisher() {
    const self = this;

    this.connection!.createConfirmChannel(function (
      error: any,
      newChannel: amqp.Channel
    ) {
      if (self.onErrorHandler(error)) return;

      newChannel.on("error", function (error: any) {
        console.error("[AMQP] channel error", error.message);
      });

      newChannel.on("close", function () {
        console.log("[AMQP] channel closed");
      });

      self.channel = newChannel;

      self.channel.assertExchange(self.exchange_name, "x-delayed-message", {
        autoDelete: false,
        durable: true,
        arguments: { "x-delayed-type": "direct" },
      });

      self.channel.bindQueue(
        self.queue_url,
        self.exchange_name,
        self.routing_key
      );
    });
  }

  private startConsumer(onConsume: Function) {
    const self = this;

    this.connection!.createChannel(function (error, newChannel) {
      if (self.onErrorHandler(error)) return;

      newChannel.on("error", function (error) {
        console.error("[AMQP] channel error", error.message);
      });

      newChannel.on("close", function () {
        console.log("[AMQP] channel closed");
      });

      newChannel.assertQueue(
        process.env.QUEUE_NAME,
        { durable: true },
        function (error) {
          if (self.onErrorHandler(error)) return;
          newChannel.consume(
            process.env.QUEUE_NAME!,
            function (message) {
              try {
                newChannel.ack(message!);
                onConsume(message);
              } catch (error) {
                self.onErrorHandler(error);
              }
            },
            { noAck: false }
          );
          console.log("Worker is started");
        }
      );
    });
  }

  private onErrorHandler(error: any) {
    if (!error) return false;
    console.error("[AMQP] error", error);
    this.connection!.close();
    return true;
  }
}

export default AMQP;
