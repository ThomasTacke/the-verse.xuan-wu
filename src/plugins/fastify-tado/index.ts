import * as fp from 'fastify-plugin';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { interval, BehaviorSubject } from 'rxjs';
import { IClientPublishOptions } from 'async-mqtt';
import { FastifyInstance } from 'fastify';
import { Room, DEVICE, SENSOR_TYPE } from '@smart-home-the-verse/the-halo';

const instance = axios.create({
  baseURL: 'https://my.tado.com/api/v2/homes/384414',
  validateStatus: function (status) { return status >= 200 && status < 300 }
})

const email = process.env.TADO_EMAIL;
const password = process.env.TADO_PASSWORD;

const mqttPublishOpts: IClientPublishOptions = {
  qos: 0,
  retain: true
};

export interface TadoRoom extends Room {
  RoomId: number;
}

const rooms: TadoRoom[] = [{
  Name: 'Living Room',
  RoomId: 3,
  Sensors: [{
    Name: 'Temperature',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.TEMPERATURE,
    Topic: 'the-verse/living-room/tado/temperature',
    Value: new BehaviorSubject<number>(null)
  }, {
    Name: 'Humidity',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.HUMIDITY,
    Topic: 'the-verse/living-room/tado/humidity',
    Value: new BehaviorSubject<number>(null)
  }]
}, {
  Name: 'Kitchen',
  RoomId: 2,
  Sensors: [{
    Name: 'Temperature',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.TEMPERATURE,
    Topic: 'the-verse/kitchen/tado/temperature',
    Value: new BehaviorSubject<number>(null)
  }, {
    Name: 'Humidity',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.HUMIDITY,
    Topic: 'the-verse/kitchen/tado/humidity',
    Value: new BehaviorSubject<number>(null)
  }]
}, {
  Name: 'Bathroom',
  RoomId: 1,
  Sensors: [{
    Name: 'Temperature',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.TEMPERATURE,
    Topic: 'the-verse/bathroom/tado/temperature',
    Value: new BehaviorSubject<number>(null)
  }, {
    Name: 'Humidity',
    Device: DEVICE.TADO,
    Type: SENSOR_TYPE.HUMIDITY,
    Topic: 'the-verse/bathroom/tado/humidity',
    Value: new BehaviorSubject<number>(null)
  }]
}];


export default fp(async (fastify) => {
  // It's like the constructor or ngOnInit
  fromTadoToBroker(fastify);
  // console.log(await setRadiatorTemperature(rooms[1].RoomId, 23));
  interval(60 * 5 * 1000).subscribe(async () => {
    fromTadoToBroker(fastify);
  });
});

async function fromTadoToBroker(fastify: FastifyInstance): Promise<void> {
  const isAuth = await isAuthenticated()
  if (isAuth) {
    for (let index = 0; index < rooms.length; index++) {
      const room = rooms[index];
      const resRoomSensorData = await getRoomSensorData(room.RoomId);
      const sensorValues = {
        temperature: resRoomSensorData.insideTemperature.celsius.toString(),
        humidity: resRoomSensorData.humidity.percentage.toString()
      }
      room.Sensors.forEach(sensor => {
        fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: sensor.Topic, room: room.Name, payload: JSON.stringify(sensorValues[sensor.Type]) })
        fastify.mqtt.publish(sensor.Topic, sensorValues[sensor.Type], mqttPublishOpts).catch(console.log);
      })
    }
  }
}
