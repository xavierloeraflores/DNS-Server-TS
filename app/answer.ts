import { ResourceRecordClass, ResourceRecordType } from "./enums";
import {
  createNameBuffer,
  createTypeAndClassCodeBuffer,
  createTTLBuffer,
  createIntegerBuffer,
  createIPV4Buffer,
} from "./buffers";

/**
 *
 * @param name Requested Resource NAME - variable bytes
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @param ttl Time To Live - 4 bytes
 * @param length RData Length - 2 bytes
 * @param data RData - variable bytes
 */
export const buildAnswerBuffer = ({
  name,
  type,
  classCode,
  ttl,
  length,
  data,
}: {
  name: string;
  type: ResourceRecordType;
  classCode: ResourceRecordClass;
  ttl: number;
  length: number;
  data: string;
}) => {
  const NameBuffer = createNameBuffer({ name });
  const TypeAndClassCodeBuffer = createTypeAndClassCodeBuffer({
    type,
    classCode,
  });

  const TTLBuffer = createTTLBuffer({ ttl });
  const DataLengthBuffer = createIntegerBuffer({ num: length, bytes: 2 });
  const AnswerDataBuffer = createIPV4Buffer({ address: data });

  const AnswerBuffer = Buffer.concat([
    NameBuffer,
    TypeAndClassCodeBuffer,
    TTLBuffer,
    DataLengthBuffer,
    AnswerDataBuffer,
  ]);
  return AnswerBuffer;
};
