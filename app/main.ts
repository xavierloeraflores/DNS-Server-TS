import * as dgram from "dgram";
import { ResourceRecordClass, ResourceRecordType } from "./enums";
import { buildHeaderBuffer } from "./header";
import { buildQuestionBuffer } from "./question";
import { buildAnswerBuffer } from "./answer";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const header = buildHeaderBuffer({
      ID: 1234,
      QR: true,
      QD_COUNT: 1,
      AN_COUNT: 1,
    });
    const question = buildQuestionBuffer({
      name: "codecrafters.io",
      type: ResourceRecordType.A,
      classCode: ResourceRecordClass.IN,
    });
    const answer = buildAnswerBuffer({
      name: "codecrafters.io",
      type: ResourceRecordType.A,
      classCode: ResourceRecordClass.IN,
      ttl: 60,
      length: 4,
      data: "8.8.8.8",
    });
    const response = Buffer.concat([header, question, answer]);
    console.log({ response });

    udpSocket.send(response, remoteAddr.port, remoteAddr.address);
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
