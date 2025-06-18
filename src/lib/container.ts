import 'reflect-metadata';
import { Container } from 'inversify';
import { MemberAdapter } from '../adapters/member.adapter';
import { NotificationAdapter } from '../adapters/notification.adapter';
import { AccountAdapter } from '../adapters/account.adapter';
import { FinancialSourceAdapter } from '../adapters/financialSource.adapter';
import { ChartOfAccountAdapter } from '../adapters/chartOfAccount.adapter';
import { FinancialTransactionHeaderAdapter } from '../adapters/financialTransactionHeader.adapter';
import { MemberRepository } from '../repositories/member.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { AccountRepository } from '../repositories/account.repository';
import { FinancialSourceRepository } from '../repositories/financialSource.repository';
import { ChartOfAccountRepository } from '../repositories/chartOfAccount.repository';
import { FinancialTransactionHeaderRepository } from '../repositories/financialTransactionHeader.repository';

const container = new Container();

// Register adapters
container.bind(MemberAdapter).toSelf().inSingletonScope();
container.bind(NotificationAdapter).toSelf().inSingletonScope();
container.bind(AccountAdapter).toSelf().inSingletonScope();
container.bind(FinancialSourceAdapter).toSelf().inSingletonScope();
container.bind(ChartOfAccountAdapter).toSelf().inSingletonScope();
container.bind(FinancialTransactionHeaderAdapter).toSelf().inSingletonScope();

// Register repositories
container.bind(MemberRepository).toSelf().inSingletonScope();
container.bind(NotificationRepository).toSelf().inSingletonScope();
container.bind(AccountRepository).toSelf().inSingletonScope();
container.bind(FinancialSourceRepository).toSelf().inSingletonScope();
container.bind(ChartOfAccountRepository).toSelf().inSingletonScope();
container.bind(FinancialTransactionHeaderRepository).toSelf().inSingletonScope();

export { container };