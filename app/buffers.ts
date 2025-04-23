import type { ResourceRecordClass, ResourceRecordType } from "./enums";

/**
 * @param ttl Time To Live - 4 bytes
 * @returns TTLBuffer - 4 bytes
 */
export function createTTLBuffer({ ttl }: { ttl: number }) {
  const TTLBuffer = new Uint8Array(4);
  TTLBuffer[0] = (ttl >> 24) & 0xff;
  TTLBuffer[1] = (ttl >> 16) & 0xff;
  TTLBuffer[2] = (ttl >> 8) & 0xff;
  TTLBuffer[3] = (ttl >> 0) & 0xff;
  return TTLBuffer;
}

/**
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @returns TypeAndClassCodeBuffer - 4 bytes
 */
export function createTypeAndClassCodeBuffer({
  type,
  classCode,
}: {
  type: ResourceRecordType;
  classCode: ResourceRecordClass;
}) {
  //Create the buffer containing the Requested Resource Type & Class
  const highTypeByte = (type >> 8) & 0xff;
  const lowTypeByte = type & 0xff;
  const highClassByte = (classCode >> 8) & 0xff;
  const lowClassByte = classCode & 0xff;
  const TypeAndClassCodeBuffer = new Uint8Array([
    highTypeByte,
    lowTypeByte,
    highClassByte,
    lowClassByte,
  ]);

  return TypeAndClassCodeBuffer;
}

/**
 * @param name Requested Resource NAME - variable bytes
 * @returns NameBuffer - variable bytes
 */
export function createNameBuffer({ name }: { name: string }) {
  // Domains may have multiple labels separated by a "."
  const labels = name.split(".");
  // Each label must then be added to the Requested Resource Name buffer
  // as such <length><content> for every label and finally with a null byte

  let nameBufferLength = 0;
  const labelBuffers: Array<Array<number>> = [];
  labels.forEach((label) => {
    const curBuffer: Array<number> = [];
    for (let i = 0; i < label.length; i++) {
      const curChar = label.charCodeAt(i);
      curBuffer.push(curChar);
    }
    labelBuffers.push(curBuffer);
    nameBufferLength += curBuffer.length + 1;
  });

  const nameBuffer = new Uint8Array(nameBufferLength + 1);
  let curByte = 0;

  labelBuffers.forEach((labelBuffer) => {
    const labelBufferLength = labelBuffer.length;
    nameBuffer[curByte] = labelBufferLength & 0xff;
    curByte++;
    labelBuffer.forEach((labelByte) => {
      nameBuffer[curByte] = labelByte;
      curByte++;
    });
  });

  nameBuffer[nameBuffer.length - 1] = 0x00; //Null Byte to terminate name labels sequence
  return nameBuffer;
}

/**
 * @param num - number to be converted into an integer buffer
 * @param bytes - the number of bytes in the integer buffer
 * @returns IntegerBuffer - the resulting buffer
 */
export function createIntegerBuffer({
  num,
  bytes,
}: {
  num: number;
  bytes: number;
}) {
  const IntegerBuffer = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    const offset = 8 * (bytes - (i + 1));
    IntegerBuffer[i] = (num >> offset) & 0xff;
  }
  return IntegerBuffer;
}
