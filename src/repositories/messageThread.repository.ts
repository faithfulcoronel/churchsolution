import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { MessageThread } from '../models/messageThread.model';
import type { IMessageThreadAdapter } from '../adapters/messageThread.adapter';
import { TYPES } from '../lib/types';

export interface IMessageThreadRepository extends BaseRepository<MessageThread> {}

@injectable()
export class MessageThreadRepository
  extends BaseRepository<MessageThread>
  implements IMessageThreadRepository
{
  constructor(@inject(TYPES.IMessageThreadAdapter) adapter: IMessageThreadAdapter) {
    super(adapter);
  }
}
