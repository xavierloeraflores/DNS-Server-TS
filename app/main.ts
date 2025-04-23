import * as dgram from "dgram";
import { ResourceRecordClass, ResourceRecordType } from "./enums";
import {
  createTTLBuffer,
  createNameBuffer,
  createTypeAndClassCodeBuffer,
} from "./buffers";
import { buildHeaderBuffer } from "./header";
import { buildQuestionBuffer } from "./question";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const header = buildHeaderBuffer({ ID: 1234, QR: true, QD_COUNT: 1 });
    const question = buildQuestionBuffer({
      name: "codecrafters.io",
      type: ResourceRecordType.A,
      classCode: ResourceRecordClass.IN,
    });
    const response = Buffer.concat([header, question]);
    console.log({ response });

    udpSocket.send(response, remoteAddr.port, remoteAddr.address);
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});

/**
 *
 * @param name Requested Resource NAME - variable bytes
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @param ttl Time To Live - 4 bytes
 * @param data RData - variable bytes
 */
const createAnswerSectionBuffer = ({
  name,
  type,
  classCode,
  ttl,
  data,
}: {
  name: string;
  type: ResourceRecordType;
  classCode: ResourceRecordClass;
  ttl: number;
  data: string;
}) => {
  const NameBuffer = createNameBuffer({ name });
  const TypeAndClassCodeBuffer = createTypeAndClassCodeBuffer({
    type,
    classCode,
  });

  const TTLBuffer = createTTLBuffer({ ttl });
  const AnswerDataBuffer = new Uint8Array();

  const AnswerBuffer = Buffer.concat([
    NameBuffer,
    TypeAndClassCodeBuffer,
    TTLBuffer,
    AnswerDataBuffer,
  ]);
  return AnswerBuffer;
};
