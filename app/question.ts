import { ResourceRecordClass, ResourceRecordType } from "./enums";
import { createNameBuffer, createTypeAndClassCodeBuffer } from "./buffers";
/**
 * @param name Requested Resource NAME - variable bytes
 * @param type Requested Resource TYPE - 2 bytes
 * @param classCode CLASS Code - 2 bytes
 * @returns QuestionSectionBuffer - variable bytes
 */
export const buildQuestionBuffer = ({
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
