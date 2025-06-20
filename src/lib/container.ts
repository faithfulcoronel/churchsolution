import 'reflect-metadata';
import { Container } from 'inversify';
import { MemberAdapter, type IMemberAdapter } from '../adapters/member.adapter';
import {
  NotificationAdapter,
  type INotificationAdapter
} from '../adapters/notification.adapter';
import { AccountAdapter, type IAccountAdapter } from '../adapters/account.adapter';
import {
  FinancialSourceAdapter,
  type IFinancialSourceAdapter
} from '../adapters/financialSource.adapter';
import {
  ChartOfAccountAdapter,
  type IChartOfAccountAdapter
} from '../adapters/chartOfAccount.adapter';
import {
  FinancialTransactionHeaderAdapter,
  type IFinancialTransactionHeaderAdapter
} from '../adapters/financialTransactionHeader.adapter';
import { MemberRepository, type IMemberRepository } from '../repositories/member.repository';
import {
  NotificationRepository,
  type INotificationRepository
} from '../repositories/notification.repository';
import { AccountRepository, type IAccountRepository } from '../repositories/account.repository';
import {
  FinancialSourceRepository,
  type IFinancialSourceRepository
} from '../repositories/financialSource.repository';
import {
  ChartOfAccountRepository,
  type IChartOfAccountRepository
} from '../repositories/chartOfAccount.repository';
import {
  FinancialTransactionHeaderRepository,
  type IFinancialTransactionHeaderRepository
} from '../repositories/financialTransactionHeader.repository';
import { SupabaseAuditService, type AuditService } from '../services/AuditService';

const container = new Container();

const TYPES = {
  IMemberAdapter: 'IMemberAdapter',
  INotificationAdapter: 'INotificationAdapter',
  IAccountAdapter: 'IAccountAdapter',
  IFinancialSourceAdapter: 'IFinancialSourceAdapter',
  IChartOfAccountAdapter: 'IChartOfAccountAdapter',
  IFinancialTransactionHeaderAdapter: 'IFinancialTransactionHeaderAdapter',
  IMemberRepository: 'IMemberRepository',
  INotificationRepository: 'INotificationRepository',
  IAccountRepository: 'IAccountRepository',
  IFinancialSourceRepository: 'IFinancialSourceRepository',
  IChartOfAccountRepository: 'IChartOfAccountRepository',
  IFinancialTransactionHeaderRepository: 'IFinancialTransactionHeaderRepository',
  AuditService: 'AuditService'
};

// Register adapters
container
  .bind<IMemberAdapter>(TYPES.IMemberAdapter)
  .to(MemberAdapter)
  .inSingletonScope();
container
  .bind<INotificationAdapter>(TYPES.INotificationAdapter)
  .to(NotificationAdapter)
  .inSingletonScope();
container
  .bind<IAccountAdapter>(TYPES.IAccountAdapter)
  .to(AccountAdapter)
  .inSingletonScope();
container
  .bind<IFinancialSourceAdapter>(TYPES.IFinancialSourceAdapter)
  .to(FinancialSourceAdapter)
  .inSingletonScope();
container
  .bind<IChartOfAccountAdapter>(TYPES.IChartOfAccountAdapter)
  .to(ChartOfAccountAdapter)
  .inSingletonScope();
container
  .bind<IFinancialTransactionHeaderAdapter>(TYPES.IFinancialTransactionHeaderAdapter)
  .to(FinancialTransactionHeaderAdapter)
  .inSingletonScope();

// Register services
container
  .bind<AuditService>(TYPES.AuditService)
  .to(SupabaseAuditService)
  .inSingletonScope();

// Register repositories
container
  .bind<IMemberRepository>(TYPES.IMemberRepository)
  .to(MemberRepository)
  .inSingletonScope();
container
  .bind<INotificationRepository>(TYPES.INotificationRepository)
  .to(NotificationRepository)
  .inSingletonScope();
container
  .bind<IAccountRepository>(TYPES.IAccountRepository)
  .to(AccountRepository)
  .inSingletonScope();
container
  .bind<IFinancialSourceRepository>(TYPES.IFinancialSourceRepository)
  .to(FinancialSourceRepository)
  .inSingletonScope();
container
  .bind<IChartOfAccountRepository>(TYPES.IChartOfAccountRepository)
  .to(ChartOfAccountRepository)
  .inSingletonScope();
container
  .bind<IFinancialTransactionHeaderRepository>(
    TYPES.IFinancialTransactionHeaderRepository
  )
  .to(FinancialTransactionHeaderRepository)
  .inSingletonScope();

export { container, TYPES };
