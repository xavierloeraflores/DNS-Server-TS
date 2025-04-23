import * as dgram from "dgram";
import { ResourceRecordClass, ResourceRecordType } from "./enums";
import {
  createTTLBuffer,
  createNameBuffer,
  createTypeAndClassCodeBuffer,
} from "./buffers";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const header = createDNSHeaderBuffer({ ID: 1234, QR: true, QD_COUNT: 1 });
    const question = createQuestionSectionBuffer({
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

const createDNSHeaderBuffer = ({
  ID = 0, // Transaction ID | 16 bits
  QR = false, // Query Response Indicator | 1 bit
  OP_CODE = 0, // Operation Code | 4 bits
  AA = false, // Authoritative Answer | 1 bit
  TC = false, // Truncation | 1 bit
  RD = false, // Recursion Desired | 1 bit
  RA = false, // Recursion Available | 1 bit
  Z = 0, // Reserved | 3 bits
  R_CODE = 0, // Response Code | 4 bits
  QD_COUNT = 0, // Question Count | 16 bits
  AN_COUNT = 0, // Answer Count | 16 bits
  NS_COUNT = 0, // Authority Count | 16 bits
  AR_COUNT = 0, // Additional Records Count | 16 bits
}: {
  ID?: number;
  QR?: boolean;
  OP_CODE?: number;
  AA?: boolean;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  Z?: number;
  R_CODE?: number;
  QD_CODE?: number;
  QD_COUNT?: number;
  AN_COUNT?: number;
  NS_COUNT?: number;
  AR_COUNT?: number;
}) => {
  const byteArray = new Uint8Array(12);
  const idLower = ID & 0xff;
  const idHigher = (ID >> 8) & 0xff;

  let comboByteA = 0;
  const qr = ((QR ? 1 : 0) << 7) & 0xff;
  const opCode = (OP_CODE << 3) & 0xff;
  const aa = ((AA ? 1 : 0) << 3) & 0xff;
  const tc = ((TC ? 1 : 0) << 2) & 0xff;
  const rd = (RD ? 1 : 0) & 0xff;
  comboByteA |= qr;
  comboByteA |= opCode;
  comboByteA |= aa;
  comboByteA |= tc;
  comboByteA |= rd;

  let comboByteB = 0;
  const ra = ((RA ? 1 : 0) & 0xff) >> 7;
  const z = (Z & 0xff) >> 4;
  const r_code = R_CODE & 0xff;
  comboByteB |= ra;
  comboByteB |= z;
  comboByteB |= r_code;

  const qdCountLower = QD_COUNT & 0xff;
  const qdCountHigher = (QD_COUNT >> 8) & 0xff;
  const anCountLower = AN_COUNT & 0xff;
  const anCountHigher = (AN_COUNT >> 8) & 0xff;
  const nsCountLower = NS_COUNT & 0xff;
  const nsCountHigher = (NS_COUNT >> 8) & 0xff;
  const arCountLower = AR_COUNT & 0xff;
  const arCountHigher = (AR_COUNT >> 8) & 0xff;

  byteArray[0] = idHigher;
  byteArray[1] = idLower;
  byteArray[2] = comboByteA;
  byteArray[3] = comboByteB;
  byteArray[4] = qdCountHigher;
  byteArray[5] = qdCountLower;
  byteArray[6] = anCountHigher;
  byteArray[7] = anCountLower;
  byteArray[8] = nsCountHigher;
  byteArray[9] = nsCountLower;
  byteArray[10] = arCountHigher;
  byteArray[11] = arCountLower;

  const headerBuffer = Buffer.from(byteArray);
  return headerBuffer;
};

/**
 *
 * @param name Requested Resource NAME - variable bytes
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @returns QuestionSectionBuffer - variable bytes
 */
const createQuestionSectionBuffer = ({
  name,
  type,
  classCode,
}: {
  name: string;
  type: ResourceRecordType;
  classCode: ResourceRecordClass;
}) => {
  const nameBuffer = createNameBuffer({ name });

  const TypeAndClassCodeBuffer = createTypeAndClassCodeBuffer({
    type,
    classCode,
  });
  const QuestionSectionBuffer = Buffer.concat([
    nameBuffer,
    TypeAndClassCodeBuffer,
  ]);

  return QuestionSectionBuffer;
};

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
