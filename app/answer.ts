import { ResourceRecordClass, ResourceRecordType } from "./enums";
import {
  createNameBuffer,
  createTypeAndClassCodeBuffer,
  createTTLBuffer,
} from "./buffers";

/**
 *
 * @param name Requested Resource NAME - variable bytes
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @param ttl Time To Live - 4 bytes
 * @param data RData - variable bytes
 */
export const buildAnswerBuffer = ({
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
