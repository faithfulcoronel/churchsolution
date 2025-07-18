import { injectable, inject } from 'inversify';
import { BaseRepository } from './base.repository';
import { Message } from '../models/message.model';
import type { IMessageAdapter } from '../adapters/message.adapter';
import { TYPES } from '../lib/types';

export interface IMessageRepository extends BaseRepository<Message> {}

@injectable()
export class MessageRepository
  extends BaseRepository<Message>
  implements IMessageRepository
{
  constructor(@inject(TYPES.IMessageAdapter) adapter: IMessageAdapter) {
    super(adapter);
  }
}
