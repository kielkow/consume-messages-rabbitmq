const RabbitMq = require('./rabbitmq');

module.exports = async ({ amqpUrl, queueName }) => {
  const rabbitMq = new RabbitMq({ amqpUrl });

  await rabbitMq.connect();

  if (!rabbitMq.channel) rabbitMq.channel = await rabbitMq.createChannel();

  await rabbitMq.channel.assertQueue(queueName, { durable: true });

  return rabbitMq;
};
