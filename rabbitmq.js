const amqp = require('amqplib');
const amqp = require('amqplib/callback_api');

module.exports = class RabbitMq {
   constructor({
      amqpUrl
   }) {
      this.amqpUrl = amqpUrl;
      this.connection = undefined;
      this.channel = undefined;
   }

   async connect() {
      this.connection = await new Promise((resolve, reject) => {
         amqp.connect(this.amqpUrl, (error, connection) => {
            if (error) {
               return reject(error);
            }
            return resolve(connection);
         });
      });
   }

   createConfirmChannel() {
      return new Promise((resolve, reject) => {
         this.connection.createConfirmChannel((error, channel) => {
            if (error) {
               return reject(error);
            }
            return resolve(channel);
         });
      });
   }

   createChannel() {
      return new Promise((resolve, reject) => {
         this.connection.createChannel((error, channel) => {
            if (error) {
               return reject(error);
            }
            return resolve(channel);
         });
      });
   }

   async sendToQueue({
      queueName,
      data
   }) {
      if (!this.connection) {
         throw 'rabbitMQ\'s instance is not connected! ';
      }

      if (!this.channel) {
         this.channel = await this.createConfirmChannel();
      }

      if (typeof data !== 'string') {
         data = JSON.stringify(data);
      }

      this.channel.assertQueue(queueName, {
         durable: true
      });

      return new Promise((resolve, reject) => {
         const message = Buffer.from(data);
         const sendMessageToQueue = this.channel.sendToQueue(queueName, message);
         if (!sendMessageToQueue) {
            return reject('Cannot send message!');
         }
         return resolve(sendMessageToQueue);
      });
   }

   async consumeQueue({
      queueName
   }) {
      if (!this.connection) throw 'rabbitMQ\'s instance is not connected! ';

      if (!this.channel) this.channel = await this.createChannel();

      this.channel.assertQueue(queueName, {
         durable: true
      });
      const messages = [];

      this.channel.consume(
         queueName,
         (msg) => {
            if (msg !== null) {
               messages.push(JSON.parse(msg.content.toString()));
            }
         }, {
            noAck: true
         }
      );

      return messages;
   }

   async getMessageCount({
      queueName
   }) {
      if (!this.connection) {
         throw 'rabbitMQ\'s instance is not connected! ';
      }

      if (!this.channel) {
         this.channel = await this.createChannel();
      }
      return new Promise((resolve, reject) => {
         this.channel.assertQueue(queueName, {
            durable: true
         }, (err, data) => {
            if (err) reject(err);
            resolve(data.messageCount);
         });
      });
   }

   async closeConnection() {
      if (this.connection) {
         await this.connection.close();
      }
   }

   async closeChannel() {
      if (this.channel) {
         await this.channel.close();
      }
   }

   async function getOpenConnections() {
      try {
         const connection = await amqp.connect(process.env.RABBITMQ_URL);
         const channel = await connection.createChannel();

         const info = await channel.connection.serverProperties;
         const openConnections = info['rabbitmq.connection_state']['open_connections'];

         console.log('Number of open connections:', openConnections);

         await channel.close();
         await connection.close();
      } catch (error) {
         console.error('Error:', error);
      }
   }
};
