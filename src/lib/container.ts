import 'reflect-metadata';
import { Container } from 'inversify';
import { MemberAdapter } from '../adapters/member.adapter';
import { NotificationAdapter } from '../adapters/notification.adapter';
import { MemberRepository } from '../repositories/member.repository';
import { NotificationRepository } from '../repositories/notification.repository';

const container = new Container();

// Register adapters
container.bind(MemberAdapter).toSelf().inSingletonScope();
container.bind(NotificationAdapter).toSelf().inSingletonScope();

// Register repositories
container.bind(MemberRepository).toSelf().inSingletonScope();
container.bind(NotificationRepository).toSelf().inSingletonScope();

export { container };