import {
  downloadBachelorThesisProcessFile,
  getBachelorThesisProcessDetails,
  sendBachelorThesisProcessEventCommit,
  sendBachelorThesisProcessEventInit,
} from '../generated/bachelor-thesis-process';
import { wrapPostWithFiles } from './post-with-files';

export const sendBachelorThesisProcessEvent = wrapPostWithFiles(
  sendBachelorThesisProcessEventInit,
  sendBachelorThesisProcessEventCommit,
);

export { getBachelorThesisProcessDetails, downloadBachelorThesisProcessFile };
